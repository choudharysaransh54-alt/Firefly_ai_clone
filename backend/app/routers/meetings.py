"""/api/meetings — CRUD for meetings plus AI notes, export and AskFred."""
import re
from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, get_meeting_or_404
from ..services import assistant, exporter, meeting_service

router = APIRouter(prefix="/meetings", tags=["meetings"])


@router.get("", response_model=list[schemas.MeetingListItem])
def list_meetings(
    q: str | None = Query(None, description="Matches title, participant name or transcript text"),
    participant: str | None = None,
    tag: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    sort: Literal["newest", "oldest"] = "newest",
    limit: int | None = Query(None, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return meeting_service.list_meetings(db, q, participant, tag, date_from, date_to, sort, limit)


@router.post("", response_model=schemas.MeetingDetail, status_code=201)
def create_meeting(
    data: schemas.MeetingCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    try:
        meeting = meeting_service.create_meeting(db, user, data)
    except ValueError as exc:  # transcript could not be parsed
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return meeting_service.get_meeting(db, meeting.id)


@router.get("/{meeting_id}", response_model=schemas.MeetingDetail)
def get_meeting(meeting: models.Meeting = Depends(get_meeting_or_404)):
    return meeting


@router.patch("/{meeting_id}", response_model=schemas.MeetingDetail)
def update_meeting(
    data: schemas.MeetingUpdate,
    meeting: models.Meeting = Depends(get_meeting_or_404),
    db: Session = Depends(get_db),
):
    return meeting_service.update_meeting(db, meeting, data)


@router.delete("/{meeting_id}", status_code=204)
def delete_meeting(meeting: models.Meeting = Depends(get_meeting_or_404), db: Session = Depends(get_db)):
    db.delete(meeting)  # cascades to transcript, summary, chapters, action items and comments
    db.commit()


@router.post("/{meeting_id}/summary", response_model=schemas.MeetingDetail)
def regenerate_summary(meeting: models.Meeting = Depends(get_meeting_or_404), db: Session = Depends(get_db)):
    return meeting_service.regenerate_notes(db, meeting)


@router.get("/{meeting_id}/export")
def export_meeting(
    format: schemas.ExportFormat = "md",
    meeting: models.Meeting = Depends(get_meeting_or_404),
):
    content = exporter.export_meeting(meeting, format)
    filename = re.sub(r"[^a-z0-9]+", "-", meeting.title.lower()).strip("-") or "meeting"
    return Response(
        content,
        media_type="text/markdown" if format == "md" else "text/plain",
        headers={"Content-Disposition": f'attachment; filename="{filename}.{format}"'},
    )


@router.post("/{meeting_id}/ask", response_model=schemas.AskResponse)
def ask_about_meeting(data: schemas.AskRequest, meeting: models.Meeting = Depends(get_meeting_or_404)):
    answer = assistant.answer_question(meeting, data.question)
    return schemas.AskResponse(
        answer=answer.text,
        sources=[schemas.AskSource.model_validate(s) for s in answer.sources],
        generated_by=answer.generated_by,
    )

"""Action items: list across meetings, add to a meeting, edit / complete, delete."""
from typing import Literal

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas
from ..database import get_db
from ..deps import get_or_404

router = APIRouter(tags=["action items"])


@router.get("/action-items", response_model=list[schemas.ActionItemWithMeetingOut])
def list_action_items(status: Literal["open", "completed", "all"] = "open", db: Session = Depends(get_db)):
    stmt = (
        select(models.ActionItem)
        .join(models.Meeting)
        .options(selectinload(models.ActionItem.meeting))
        .order_by(models.Meeting.started_at.desc(), models.ActionItem.id)
    )
    if status != "all":
        stmt = stmt.where(models.ActionItem.is_completed.is_(status == "completed"))
    return db.scalars(stmt).all()


@router.post("/meetings/{meeting_id}/action-items", response_model=schemas.ActionItemOut, status_code=201)
def create_action_item(meeting_id: int, data: schemas.ActionItemCreate, db: Session = Depends(get_db)):
    meeting = get_or_404(db, models.Meeting, meeting_id)
    item = models.ActionItem(meeting=meeting, text=data.text.strip(), assignee=data.assignee,
                             timestamp=data.timestamp)
    db.add(item)
    db.commit()
    return item


@router.patch("/action-items/{item_id}", response_model=schemas.ActionItemOut)
def update_action_item(item_id: int, data: schemas.ActionItemUpdate, db: Session = Depends(get_db)):
    item = get_or_404(db, models.ActionItem, item_id)
    # Only touch the fields the client actually sent (PATCH semantics).
    for field, value in data.model_dump(exclude_unset=True).items():
        if value is None and field in ("text", "is_completed"):
            continue  # these columns can't be empty
        setattr(item, field, value)
    db.commit()
    return item


@router.delete("/action-items/{item_id}", status_code=204)
def delete_action_item(item_id: int, db: Session = Depends(get_db)):
    db.delete(get_or_404(db, models.ActionItem, item_id))
    db.commit()

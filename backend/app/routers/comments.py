"""Comments on individual transcript lines."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, get_or_404

router = APIRouter(tags=["comments"])


@router.post("/segments/{segment_id}/comments", response_model=schemas.CommentOut, status_code=201)
def create_comment(
    segment_id: int,
    data: schemas.CommentCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    segment = get_or_404(db, models.TranscriptSegment, segment_id)
    comment = models.Comment(segment=segment, user=user, body=data.body.strip())
    db.add(comment)
    db.commit()
    return comment


@router.delete("/comments/{comment_id}", status_code=204)
def delete_comment(comment_id: int, db: Session = Depends(get_db)):
    db.delete(get_or_404(db, models.Comment, comment_id))
    db.commit()

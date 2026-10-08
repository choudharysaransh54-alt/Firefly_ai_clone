"""Shared FastAPI dependencies and helpers used by the routers."""
from typing import TypeVar

from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models
from .database import get_db
from .services import meeting_service

T = TypeVar("T")


def get_current_user(db: Session = Depends(get_db)) -> models.User:
    """Authentication is out of scope: every request acts as the default (seeded) user.
    Swapping in real auth only means changing this one function."""
    user = db.scalar(select(models.User).order_by(models.User.id))
    if user is None:
        raise HTTPException(status_code=500, detail="Default user is missing. Run the seed script.")
    return user


def get_meeting_or_404(meeting_id: int, db: Session = Depends(get_db)) -> models.Meeting:
    """Loads the full meeting for the {meeting_id} path parameter, or responds 404."""
    meeting = meeting_service.get_meeting(db, meeting_id)
    if meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


def get_or_404(db: Session, model: type[T], object_id: int) -> T:
    obj = db.get(model, object_id)
    if obj is None:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
    return obj

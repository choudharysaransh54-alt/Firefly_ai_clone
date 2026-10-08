"""Shared FastAPI dependencies and helpers used by the routers."""
from typing import TypeVar

from fastapi import Cookie, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models
from .database import get_db
from .services import meeting_service

T = TypeVar("T")


# In-memory session tracking for authenticated users: token -> user_id
ACTIVE_SESSIONS: dict[str, int] = {}
_is_logged_out: bool = False


def set_logged_out(val: bool) -> None:
    global _is_logged_out
    _is_logged_out = val


def get_current_user_optional(
    authorization: str | None = Header(None),
    auth_token: str | None = Cookie(None),
    db: Session = Depends(get_db),
) -> models.User | None:
    """Extracts authenticated user from Bearer header or auth_token cookie."""
    global _is_logged_out
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
    elif auth_token:
        token = auth_token

    if token:
        user_id = ACTIVE_SESSIONS.get(token)
        if user_id:
            user = db.get(models.User, user_id)
            if user:
                return user
        # Token provided but not found in active sessions
        return None

    # If the user has explicitly logged out, do not fall back to default user
    if _is_logged_out:
        return None

    # Fallback default user for seamless local demo before explicit logout
    return db.scalar(select(models.User).order_by(models.User.id))


def get_current_user(
    authorization: str | None = Header(None),
    auth_token: str | None = Cookie(None),
    db: Session = Depends(get_db),
) -> models.User:
    """Dependency that ensures user is authenticated, raising 401 if logged out."""
    user = get_current_user_optional(authorization, auth_token, db)
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated. Please log in.")
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

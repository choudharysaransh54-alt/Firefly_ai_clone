"""Workspace-level lookups: current user, global search, and the lists used by filters."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user
from ..services.search import search_meetings

router = APIRouter(tags=["workspace"])


@router.get("/me", response_model=schemas.UserOut)
def read_current_user(user: models.User = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=schemas.UserOut)
def update_current_user(
    payload: schemas.UserUpdate,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.name is not None:
        user.name = payload.name
    if payload.email is not None:
        user.email = payload.email
    if payload.avatar_url is not None:
        user.avatar_url = payload.avatar_url
    db.commit()
    db.refresh(user)
    return user


@router.get("/search", response_model=schemas.SearchResponse)
def search(q: str = Query(min_length=2, max_length=100), db: Session = Depends(get_db)):
    return schemas.SearchResponse(query=q, results=search_meetings(db, q))


@router.get("/participants", response_model=list[schemas.ParticipantOut])
def list_participants(db: Session = Depends(get_db)):
    return db.scalars(select(models.Participant).order_by(models.Participant.name)).all()


@router.get("/tags", response_model=list[schemas.TagOut])
def list_tags(db: Session = Depends(get_db)):
    return db.scalars(select(models.Tag).order_by(models.Tag.name)).all()

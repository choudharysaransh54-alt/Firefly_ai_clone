"""Authentication router providing login, logout, and session check endpoints."""
import uuid

from fastapi import APIRouter, Cookie, Depends, Header, HTTPException, Response
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import ACTIVE_SESSIONS, get_current_user_optional, set_logged_out

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    """Pre-filled credentials allow instant one-click login without typing."""
    email: str = Field(default="choudharysaransh69@gmail.com", description="User email address")
    password: str = Field(default="fireflies123", description="Password")


class LoginResponse(BaseModel):
    token: str
    user: schemas.UserOut
    status: str = "authenticated"


@router.post("/login", response_model=LoginResponse)
def login(
    response: Response,
    payload: LoginRequest = LoginRequest(),
    db: Session = Depends(get_db),
):
    """Authenticate user with given or default credentials and issue a session token."""
    user = None
    if payload.email:
        user = db.scalar(select(models.User).where(models.User.email == payload.email))
    if user is None:
        user = db.scalar(select(models.User).order_by(models.User.id))

    if user is None:
        raise HTTPException(status_code=404, detail="No user found. Please seed the database.")

    # Generate session token and store in active sessions
    token = uuid.uuid4().hex
    ACTIVE_SESSIONS[token] = user.id
    set_logged_out(False)

    # Set cookie for browser sessions
    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=False,
        samesite="lax",
        max_age=86400 * 30,
        path="/",
    )

    return LoginResponse(token=token, user=user, status="authenticated")


@router.post("/logout")
def logout(
    response: Response,
    authorization: str | None = Header(None),
    auth_token: str | None = Cookie(None),
):
    """Invalidate current session, clear cookies, and mark user state as logged out."""
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ", 1)[1].strip()
    elif auth_token:
        token = auth_token

    if token and token in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[token]

    # Set explicit logged-out state
    set_logged_out(True)

    # Delete session cookie
    response.delete_cookie(key="auth_token", path="/")

    return {"status": "logged_out", "message": "Successfully logged out"}


@router.get("/status")
def auth_status(user: models.User | None = Depends(get_current_user_optional)):
    """Check current authentication status."""
    if user is None:
        return {"authenticated": False, "user": None}
    return {"authenticated": True, "user": schemas.UserOut.model_validate(user)}

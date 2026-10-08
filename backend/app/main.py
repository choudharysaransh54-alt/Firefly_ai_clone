"""FastAPI application entry point.

Run locally with:  uvicorn app.main:app --reload --port 8000
Interactive API docs are served at /docs.
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, SessionLocal, engine
from .routers import action_items, comments, meetings, workspace
from .seed.seed import seed_if_empty


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # On startup: create any missing tables, then seed demo data into an empty database.
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_if_empty(db)
    yield


app = FastAPI(title="Fireflies Clone API", version="1.0.0", lifespan=lifespan)

# The Next.js frontend runs on a different origin, so the browser needs CORS headers.
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (meetings.router, action_items.router, comments.router, workspace.router):
    app.include_router(router, prefix="/api")


@app.get("/api/health", tags=["workspace"])
def health():
    return {"status": "ok"}

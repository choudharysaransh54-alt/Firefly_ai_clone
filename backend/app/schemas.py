"""Pydantic schemas: the shapes of request bodies and JSON responses.

*Out schemas are built straight from ORM objects (from_attributes=True).
*Create / *Update schemas validate what the client sends.
"""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------- Responses ----------

class UserOut(ORMModel):
    id: int
    name: str
    email: str
    avatar_url: str | None = None


class UserUpdate(ORMModel):
    name: str | None = None
    email: str | None = None
    avatar_url: str | None = None


class ParticipantOut(ORMModel):
    id: int
    name: str
    email: str | None


class TagOut(ORMModel):
    id: int
    name: str
    color: str


class CommentOut(ORMModel):
    id: int
    segment_id: int
    body: str
    author_name: str
    created_at: datetime


class SegmentOut(ORMModel):
    id: int
    position: int
    speaker: str
    start_time: float
    end_time: float
    text: str
    comments: list[CommentOut]


class SummaryOut(ORMModel):
    overview: str
    keywords: list[str]
    generated_by: str


class ChapterOut(ORMModel):
    id: int
    title: str
    start_time: float
    summary: str


class ActionItemOut(ORMModel):
    id: int
    meeting_id: int
    text: str
    assignee: str | None
    timestamp: float | None
    is_completed: bool
    created_at: datetime


class ActionItemWithMeetingOut(ActionItemOut):
    meeting_title: str


class MeetingListItem(ORMModel):
    id: int
    title: str
    started_at: datetime
    duration_seconds: int
    source: str
    participants: list[ParticipantOut]
    tags: list[TagOut]
    open_action_items: int
    overview_snippet: str | None


class MeetingDetail(MeetingListItem):
    summary: SummaryOut | None
    chapters: list[ChapterOut]
    action_items: list[ActionItemOut]
    segments: list[SegmentOut]


class AskSource(ORMModel):
    id: int
    speaker: str
    start_time: float
    text: str


class AskResponse(BaseModel):
    answer: str
    sources: list[AskSource]
    generated_by: str


class SearchMatch(ORMModel):
    id: int
    speaker: str
    start_time: float
    text: str


class SearchResult(BaseModel):
    meeting_id: int
    meeting_title: str
    started_at: datetime
    title_match: bool
    matches: list[SearchMatch]


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResult]


# ---------- Requests ----------

class MeetingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    started_at: datetime | None = None  # defaults to "now"
    participants: list[str] = []
    tags: list[str] = []
    transcript: str = Field(
        min_length=1, max_length=2_000_000, description="Raw .txt / .vtt / .srt / .json transcript"
    )
    filename: str | None = None  # helps detect the transcript format
    source: Literal["upload", "paste"] = "paste"


class MeetingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    started_at: datetime | None = None
    participants: list[str] | None = None
    tags: list[str] | None = None


class ActionItemCreate(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    assignee: str | None = None
    timestamp: float | None = None


class ActionItemUpdate(BaseModel):
    text: str | None = Field(default=None, min_length=1, max_length=500)
    assignee: str | None = None
    timestamp: float | None = None
    is_completed: bool | None = None


class CommentCreate(BaseModel):
    body: str = Field(min_length=1, max_length=2000)


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)


ExportFormat = Literal["md", "txt"]

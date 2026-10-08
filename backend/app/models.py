"""SQLAlchemy ORM models — this file *is* the database schema.

Relationships at a glance:
    User 1──* Meeting
    Meeting *──* Participant   (through meeting_participants)
    Meeting *──* Tag           (through meeting_tags)
    Meeting 1──* TranscriptSegment 1──* Comment *──1 User
    Meeting 1──1 Summary
    Meeting 1──* Chapter
    Meeting 1──* ActionItem
"""
from datetime import datetime

from sqlalchemy import JSON, Column, ForeignKey, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base

# Pure join tables for the two many-to-many relationships.
meeting_participants = Table(
    "meeting_participants",
    Base.metadata,
    Column("meeting_id", ForeignKey("meetings.id", ondelete="CASCADE"), primary_key=True),
    Column("participant_id", ForeignKey("participants.id", ondelete="CASCADE"), primary_key=True),
)

meeting_tags = Table(
    "meeting_tags",
    Base.metadata,
    Column("meeting_id", ForeignKey("meetings.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(200), unique=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    meetings: Mapped[list["Meeting"]] = relationship(back_populates="owner")


class Meeting(Base):
    __tablename__ = "meetings"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    started_at: Mapped[datetime] = mapped_column(index=True)
    duration_seconds: Mapped[int] = mapped_column(default=0)
    # Where the meeting came from: google_meet | zoom | teams | upload | paste
    source: Mapped[str] = mapped_column(String(30), default="upload")
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.now, onupdate=datetime.now)

    owner: Mapped[User] = relationship(back_populates="meetings")
    participants: Mapped[list["Participant"]] = relationship(
        secondary=meeting_participants, order_by="Participant.name"
    )
    tags: Mapped[list["Tag"]] = relationship(secondary=meeting_tags, order_by="Tag.name")

    # "all, delete-orphan": deleting a meeting deletes everything that belongs to it.
    segments: Mapped[list["TranscriptSegment"]] = relationship(
        back_populates="meeting", cascade="all, delete-orphan", order_by="TranscriptSegment.position"
    )
    summary: Mapped["Summary | None"] = relationship(
        back_populates="meeting", cascade="all, delete-orphan", uselist=False
    )
    chapters: Mapped[list["Chapter"]] = relationship(
        back_populates="meeting", cascade="all, delete-orphan", order_by="Chapter.start_time"
    )
    action_items: Mapped[list["ActionItem"]] = relationship(
        back_populates="meeting", cascade="all, delete-orphan", order_by="ActionItem.id"
    )

    # Convenience values for the API (read by Pydantic through from_attributes).
    @property
    def open_action_items(self) -> int:
        return sum(1 for item in self.action_items if not item.is_completed)

    @property
    def overview_snippet(self) -> str | None:
        if not self.summary or not self.summary.overview:
            return None
        return self.summary.overview.splitlines()[0]


class Participant(Base):
    """A person who attended one or more meetings (a shared contact directory)."""

    __tablename__ = "participants"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    email: Mapped[str | None] = mapped_column(String(200))


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    color: Mapped[str] = mapped_column(String(20), default="#7c5cff")


class TranscriptSegment(Base):
    """One line of the transcript: who spoke, when, and what they said."""

    __tablename__ = "transcript_segments"

    id: Mapped[int] = mapped_column(primary_key=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"), index=True)
    position: Mapped[int]  # order of the line within the meeting (0, 1, 2, ...)
    # Stored as plain text: uploaded transcripts may contain labels like "Speaker 2"
    # that are not real participants, and the transcript is a historical record.
    speaker: Mapped[str] = mapped_column(String(100))
    start_time: Mapped[float]  # seconds from the start of the meeting
    end_time: Mapped[float]
    text: Mapped[str] = mapped_column(Text)

    meeting: Mapped[Meeting] = relationship(back_populates="segments")
    comments: Mapped[list["Comment"]] = relationship(
        back_populates="segment", cascade="all, delete-orphan", order_by="Comment.created_at"
    )


class Summary(Base):
    """AI notes for a meeting (one per meeting)."""

    __tablename__ = "summaries"

    id: Mapped[int] = mapped_column(primary_key=True)
    meeting_id: Mapped[int] = mapped_column(
        ForeignKey("meetings.id", ondelete="CASCADE"), unique=True
    )
    overview: Mapped[str] = mapped_column(Text)  # one bullet point per line
    keywords: Mapped[list[str]] = mapped_column(JSON, default=list)
    generated_by: Mapped[str] = mapped_column(String(20), default="heuristic")  # seed | heuristic | llm
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    meeting: Mapped[Meeting] = relationship(back_populates="summary")


class Chapter(Base):
    """A section of the meeting outline, linked to the moment it starts."""

    __tablename__ = "chapters"

    id: Mapped[int] = mapped_column(primary_key=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    start_time: Mapped[float]
    summary: Mapped[str] = mapped_column(Text, default="")

    meeting: Mapped[Meeting] = relationship(back_populates="chapters")


class ActionItem(Base):
    __tablename__ = "action_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"), index=True)
    text: Mapped[str] = mapped_column(Text)
    assignee: Mapped[str | None] = mapped_column(String(100))
    timestamp: Mapped[float | None]  # moment in the meeting where the task came up
    is_completed: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.now, onupdate=datetime.now)

    meeting: Mapped[Meeting] = relationship(back_populates="action_items")

    @property
    def meeting_title(self) -> str:
        return self.meeting.title


class Comment(Base):
    """A comment left by a user on a single transcript line."""

    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    segment_id: Mapped[int] = mapped_column(
        ForeignKey("transcript_segments.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(default=datetime.now)

    segment: Mapped[TranscriptSegment] = relationship(back_populates="comments")
    user: Mapped[User] = relationship()

    @property
    def author_name(self) -> str:
        return self.user.name

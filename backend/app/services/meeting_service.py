"""Business logic for meetings: listing, creating, updating and generating AI notes.

Routers handle HTTP concerns only and call these functions.
"""
import logging
from datetime import date, datetime, time, timedelta

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas
from . import llm
from .summarizer import GeneratedNotes, SegmentLike, summarize_transcript
from .transcript_parser import ParsedSegment, parse_transcript

logger = logging.getLogger(__name__)

TAG_COLORS = ["#7c5cff", "#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#14b8a6", "#6366f1"]


def list_meetings(
    db: Session,
    q: str | None = None,
    participant: str | None = None,
    tag: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    sort: str = "newest",
    limit: int | None = None,
) -> list[models.Meeting]:
    stmt = select(models.Meeting).options(
        # Load the related rows in a few batched queries instead of one query per meeting (N+1).
        selectinload(models.Meeting.participants),
        selectinload(models.Meeting.tags),
        selectinload(models.Meeting.summary),
        selectinload(models.Meeting.action_items),
    )
    if q:
        pattern = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                models.Meeting.title.ilike(pattern),
                models.Meeting.participants.any(models.Participant.name.ilike(pattern)),
                models.Meeting.segments.any(models.TranscriptSegment.text.ilike(pattern)),
            )
        )
    if participant:
        stmt = stmt.where(models.Meeting.participants.any(models.Participant.name == participant))
    if tag:
        stmt = stmt.where(models.Meeting.tags.any(models.Tag.name == tag))
    if date_from:
        stmt = stmt.where(models.Meeting.started_at >= datetime.combine(date_from, time.min))
    if date_to:  # inclusive: everything before the start of the following day
        stmt = stmt.where(models.Meeting.started_at < datetime.combine(date_to + timedelta(days=1), time.min))

    newest_first = sort != "oldest"
    stmt = stmt.order_by(models.Meeting.started_at.desc() if newest_first else models.Meeting.started_at.asc())
    if limit:
        stmt = stmt.limit(limit)
    return list(db.scalars(stmt))


def get_meeting(db: Session, meeting_id: int) -> models.Meeting | None:
    """Load one meeting with everything the detail page needs."""
    stmt = (
        select(models.Meeting)
        .where(models.Meeting.id == meeting_id)
        .options(
            selectinload(models.Meeting.participants),
            selectinload(models.Meeting.tags),
            selectinload(models.Meeting.summary),
            selectinload(models.Meeting.chapters),
            selectinload(models.Meeting.action_items),
            selectinload(models.Meeting.segments)
            .selectinload(models.TranscriptSegment.comments)
            .selectinload(models.Comment.user),
        )
        # Re-read rows even if this session already holds the object, so collections come back sorted.
        .execution_options(populate_existing=True)
    )
    return db.scalar(stmt)


def create_meeting(db: Session, owner: models.User, data: schemas.MeetingCreate) -> models.Meeting:
    """Parse the transcript, store everything, and generate AI notes. Raises ValueError on bad input."""
    parsed = parse_transcript(data.transcript, data.filename)

    meeting = models.Meeting(
        owner=owner,
        title=data.title.strip(),
        started_at=data.started_at or datetime.now().replace(second=0, microsecond=0),
        source=data.source,
        duration_seconds=duration_of(parsed),
    )
    meeting.segments = build_segments(parsed)
    # Everyone listed in the form plus everyone who spoke in the transcript.
    speakers = [s.speaker for s in parsed if s.speaker != "Unknown speaker"]
    meeting.participants = get_or_create_participants(db, data.participants + speakers)
    meeting.tags = get_or_create_tags(db, data.tags)
    apply_notes(meeting, generate_notes(meeting.segments))

    db.add(meeting)
    db.commit()
    return meeting


def update_meeting(db: Session, meeting: models.Meeting, data: schemas.MeetingUpdate) -> models.Meeting:
    if data.title is not None:
        meeting.title = data.title.strip()
    if data.started_at is not None:
        meeting.started_at = data.started_at
    if data.participants is not None:
        meeting.participants = get_or_create_participants(db, data.participants)
    if data.tags is not None:
        meeting.tags = get_or_create_tags(db, data.tags)
    db.commit()
    return meeting


def regenerate_notes(db: Session, meeting: models.Meeting) -> models.Meeting:
    """Re-run the AI on the transcript. Keeps action items, since users may have edited them."""
    apply_notes(meeting, generate_notes(meeting.segments), include_action_items=False)
    db.commit()
    return meeting


def generate_notes(segments: list[SegmentLike]) -> GeneratedNotes:
    """Use Claude when an API key is configured, otherwise (or on any error) the rule-based summarizer."""
    if llm.is_enabled():
        try:
            return llm.generate_notes(segments)
        except Exception:
            logger.exception("LLM note generation failed; falling back to rule-based summary")
    return summarize_transcript(segments)


def apply_notes(meeting: models.Meeting, notes: GeneratedNotes, include_action_items: bool = True) -> None:
    # Update the summary row in place (instead of replacing it) to respect its UNIQUE(meeting_id).
    if meeting.summary is None:
        meeting.summary = models.Summary()
    meeting.summary.overview = notes.overview
    meeting.summary.keywords = notes.keywords
    meeting.summary.generated_by = notes.generated_by
    meeting.summary.created_at = datetime.now()

    meeting.chapters = [
        models.Chapter(title=c.title, start_time=c.start_time, summary=c.summary) for c in notes.chapters
    ]
    if include_action_items:
        meeting.action_items = [
            models.ActionItem(text=a.text, assignee=a.assignee, timestamp=a.timestamp)
            for a in notes.action_items
        ]


def build_segments(parsed: list[ParsedSegment]) -> list[models.TranscriptSegment]:
    return [
        models.TranscriptSegment(position=i, speaker=s.speaker, start_time=s.start_time,
                                 end_time=s.end_time, text=s.text)
        for i, s in enumerate(parsed)
    ]


def duration_of(parsed: list[ParsedSegment]) -> int:
    return int(round(max(s.end_time for s in parsed)))


def get_or_create_participants(db: Session, names: list[str],
                               emails: dict[str, str] | None = None) -> list[models.Participant]:
    people = []
    for name in _unique_names(names):
        person = db.scalar(select(models.Participant).where(func.lower(models.Participant.name) == name.lower()))
        if person is None:
            person = models.Participant(name=name)
            db.add(person)
        if emails and emails.get(name):
            person.email = emails[name]
        people.append(person)
    return people


def get_or_create_tags(db: Session, names: list[str]) -> list[models.Tag]:
    tags = []
    for name in _unique_names(names):
        tag = db.scalar(select(models.Tag).where(func.lower(models.Tag.name) == name.lower()))
        if tag is None:
            tag = models.Tag(name=name, color=TAG_COLORS[sum(map(ord, name)) % len(TAG_COLORS)])
            db.add(tag)
        tags.append(tag)
    return tags


def _unique_names(names: list[str]) -> list[str]:
    """Trim, drop blanks and remove case-insensitive duplicates while keeping order."""
    seen, result = set(), []
    for name in (n.strip() for n in names):
        if name and name.lower() not in seen:
            seen.add(name.lower())
            result.append(name)
    return result

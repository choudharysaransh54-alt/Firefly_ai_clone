"""Seeds the database with a default user and demo meetings from seed/data/*.json.

Each JSON file holds one meeting: metadata, transcript lines ("Speaker: text"), and
hand-written AI notes. Chapters, action items and comments point at a transcript line
by its index ("line"), so their timestamps always match the transcript.
"""
import json
from datetime import date, datetime, time, timedelta
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import models
from ..services import meeting_service
from ..services.transcript_parser import parse_transcript

DATA_DIR = Path(__file__).parent / "data"
DEFAULT_USER = {"name": "Saransh", "email": "choudharysaransh69@gmail.com", "avatar_url": "/iaf_avatar.png"}


def seed_if_empty(db: Session) -> None:
    user = db.scalar(select(models.User).order_by(models.User.id))
    if user is None:
        user = models.User(**DEFAULT_USER)
        db.add(user)
        db.commit()
    if db.scalar(select(func.count(models.Meeting.id))) == 0:
        for path in sorted(DATA_DIR.glob("*.json")):
            create_seed_meeting(db, user, json.loads(path.read_text()))


def create_seed_meeting(db: Session, user: models.User, data: dict) -> models.Meeting:
    # Seed transcripts go through the same parser as uploaded .txt files.
    segments = parse_transcript("\n".join(data["transcript"]))
    # Dates are relative to "now" so the demo always looks recent; never in the future.
    started_at = datetime.combine(date.today() - timedelta(days=data["days_ago"]), time.fromisoformat(data["time"]))
    if started_at > datetime.now():
        started_at -= timedelta(days=1)

    meeting = models.Meeting(
        owner=user,
        title=data["title"],
        started_at=started_at,
        source=data["source"],
        duration_seconds=meeting_service.duration_of(segments),
    )
    meeting.segments = meeting_service.build_segments(segments)
    meeting.participants = meeting_service.get_or_create_participants(
        db, [p["name"] for p in data["participants"]], emails={p["name"]: p.get("email") for p in data["participants"]}
    )
    meeting.tags = meeting_service.get_or_create_tags(db, data["tags"])
    meeting.summary = models.Summary(
        overview="\n".join(data["overview"]), keywords=data["keywords"], generated_by="seed"
    )
    meeting.chapters = [
        models.Chapter(title=c["title"], start_time=segments[c["line"]].start_time, summary=c["summary"])
        for c in data["chapters"]
    ]
    meeting.action_items = [
        models.ActionItem(
            text=a["text"],
            assignee=a.get("assignee"),
            timestamp=segments[a["line"]].start_time,
            is_completed=a.get("done", False),
        )
        for a in data["action_items"]
    ]
    for comment in data.get("comments", []):
        meeting.segments[comment["line"]].comments.append(models.Comment(user=user, body=comment["body"]))

    db.add(meeting)
    db.commit()
    return meeting

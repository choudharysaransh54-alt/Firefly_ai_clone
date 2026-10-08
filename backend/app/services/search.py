"""Global search across every meeting's title and transcript."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas

MAX_MATCHES_PER_MEETING = 10


def search_meetings(db: Session, query: str) -> list[schemas.SearchResult]:
    pattern = f"%{query.strip()}%"

    matching_segments = db.execute(
        select(models.TranscriptSegment, models.Meeting)
        .join(models.Meeting)
        .where(models.TranscriptSegment.text.ilike(pattern))
        .order_by(models.Meeting.started_at.desc(), models.TranscriptSegment.position)
    ).all()
    title_matches = db.scalars(
        select(models.Meeting).where(models.Meeting.title.ilike(pattern)).order_by(models.Meeting.started_at.desc())
    ).all()

    # Group transcript hits by meeting (dicts keep insertion order = newest meeting first).
    results: dict[int, schemas.SearchResult] = {}
    for meeting in title_matches:
        results[meeting.id] = _empty_result(meeting, title_match=True)
    for segment, meeting in matching_segments:
        result = results.setdefault(meeting.id, _empty_result(meeting, title_match=False))
        if len(result.matches) < MAX_MATCHES_PER_MEETING:
            result.matches.append(schemas.SearchMatch.model_validate(segment))

    return sorted(results.values(), key=lambda r: r.started_at, reverse=True)


def _empty_result(meeting: models.Meeting, title_match: bool) -> schemas.SearchResult:
    return schemas.SearchResult(
        meeting_id=meeting.id,
        meeting_title=meeting.title,
        started_at=meeting.started_at,
        title_match=title_match,
        matches=[],
    )

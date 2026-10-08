"""Export a meeting's notes and transcript as Markdown or plain text."""
from .. import models
from .timeutils import format_timestamp


def export_meeting(meeting: models.Meeting, fmt: str) -> str:
    return _to_markdown(meeting) if fmt == "md" else _to_text(meeting)


def _header_fields(meeting: models.Meeting) -> list[tuple[str, str]]:
    return [
        ("Date", meeting.started_at.strftime("%A, %B %d, %Y %I:%M %p")),
        ("Duration", f"{round(meeting.duration_seconds / 60)} min"),
        ("Participants", ", ".join(p.name for p in meeting.participants) or "—"),
    ]


def _to_markdown(meeting: models.Meeting) -> str:
    lines = [f"# {meeting.title}", ""]
    lines += [f"**{label}:** {value}  " for label, value in _header_fields(meeting)]
    if meeting.summary:
        lines += ["", "## Overview", ""]
        lines += [f"- {line}" for line in meeting.summary.overview.splitlines() if line.strip()]
        if meeting.summary.keywords:
            lines += ["", f"**Keywords:** {', '.join(meeting.summary.keywords)}"]
    if meeting.chapters:
        lines += ["", "## Outline", ""]
        lines += [f"- **{c.title}** ({format_timestamp(c.start_time)}) — {c.summary}" for c in meeting.chapters]
    if meeting.action_items:
        lines += ["", "## Action Items", ""]
        for item in meeting.action_items:
            owner = f" — _{item.assignee}_" if item.assignee else ""
            lines.append(f"- [{'x' if item.is_completed else ' '}] {item.text}{owner}")
    lines += ["", "## Transcript", ""]
    lines += [f"**{s.speaker}** `{format_timestamp(s.start_time)}`  \n{s.text}\n" for s in meeting.segments]
    return "\n".join(lines) + "\n"


def _to_text(meeting: models.Meeting) -> str:
    lines = [meeting.title, "=" * len(meeting.title)]
    lines += [f"{label}: {value}" for label, value in _header_fields(meeting)]
    if meeting.summary:
        lines += ["", "OVERVIEW"]
        lines += [f"* {line}" for line in meeting.summary.overview.splitlines() if line.strip()]
    if meeting.action_items:
        lines += ["", "ACTION ITEMS"]
        for item in meeting.action_items:
            owner = f" ({item.assignee})" if item.assignee else ""
            lines.append(f"[{'x' if item.is_completed else ' '}] {item.text}{owner}")
    lines += ["", "TRANSCRIPT"]
    lines += [f"[{format_timestamp(s.start_time)}] {s.speaker}: {s.text}" for s in meeting.segments]
    return "\n".join(lines) + "\n"

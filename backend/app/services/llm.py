"""Optional Claude integration for AI notes and "AskFred" questions.

Only used when ANTHROPIC_API_KEY is set. Callers always catch errors and fall back to
the rule-based summarizer/assistant, so the app works fully offline without a key.
"""
import os

import anthropic
from pydantic import BaseModel

from .summarizer import GeneratedActionItem, GeneratedChapter, GeneratedNotes, SegmentLike
from .timeutils import format_timestamp

MODEL = os.getenv("ANTHROPIC_MODEL", "claude-opus-5-5")
# Lets the API retry a safety-declined request on a suitable fallback model server-side.
FALLBACK_BETA = "server-side-fallback-2026-07-01"


def is_enabled() -> bool:
    return bool(os.getenv("ANTHROPIC_API_KEY"))


# The JSON shapes we ask Claude to return (the SDK turns these into a JSON schema).
class LLMChapter(BaseModel):
    title: str
    start_seconds: float
    summary: str


class LLMActionItem(BaseModel):
    text: str
    assignee: str | None
    timestamp_seconds: float | None


class LLMNotes(BaseModel):
    overview_bullets: list[str]
    keywords: list[str]
    chapters: list[LLMChapter]
    action_items: list[LLMActionItem]


class LLMAnswer(BaseModel):
    answer: str
    source_line_numbers: list[int]


def generate_notes(segments: list[SegmentLike]) -> GeneratedNotes:
    prompt = (
        "You are a meeting assistant like Fireflies.ai. Read the transcript and write meeting notes.\n"
        "- overview_bullets: 3-5 short bullet points covering decisions and key points\n"
        "- keywords: 4-8 short topic keywords\n"
        "- chapters: 3-6 outline sections in time order; start_seconds must be the start time "
        "(in seconds) of the line where the section begins\n"
        "- action_items: concrete tasks with the person responsible (a speaker name, or null) "
        "and the time in seconds where the task was mentioned\n\n"
        f"<transcript>\n{_format_transcript(segments)}\n</transcript>"
    )
    notes = _ask(prompt, LLMNotes, effort="medium")
    return GeneratedNotes(
        overview="\n".join(notes.overview_bullets),
        keywords=notes.keywords[:8],
        chapters=[GeneratedChapter(c.title, c.start_seconds, c.summary) for c in notes.chapters],
        action_items=[
            GeneratedActionItem(a.text, a.assignee, a.timestamp_seconds) for a in notes.action_items
        ],
        generated_by="llm",
    )


def answer_question(segments: list[SegmentLike], question: str) -> tuple[str, list[int]]:
    """Returns the answer and the indexes of the transcript lines it is based on."""
    prompt = (
        "Answer the question using only the meeting transcript below. Be concise (under 120 words). "
        "If the transcript does not contain the answer, say so. In source_line_numbers, list the "
        "[n] numbers of the lines that support the answer (at most 3).\n\n"
        f"<transcript>\n{_format_transcript(segments)}\n</transcript>\n\nQuestion: {question}"
    )
    result = _ask(prompt, LLMAnswer, effort="low")
    return result.answer, result.source_line_numbers


def _format_transcript(segments: list[SegmentLike]) -> str:
    return "\n".join(
        f"[{i}] {format_timestamp(s.start_time)} ({s.start_time:.0f}s) {s.speaker}: {s.text}"
        for i, s in enumerate(segments)
    )


def _ask(prompt: str, output_format: type[BaseModel], effort: str):
    client = anthropic.Anthropic()
    response = client.beta.messages.parse(
        model=MODEL,
        max_tokens=16000,
        betas=[FALLBACK_BETA],
        fallbacks="default",
        output_config={"effort": effort},
        output_format=output_format,
        messages=[{"role": "user", "content": prompt}],
    )
    if response.stop_reason == "refusal" or response.parsed_output is None:
        raise RuntimeError(f"Claude returned no usable output (stop_reason={response.stop_reason})")
    return response.parsed_output

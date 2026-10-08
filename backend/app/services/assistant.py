"""AskFred: answer a question about one meeting.

Uses Claude when configured; otherwise a small rule-based assistant that understands a few
common intents (action items, summary, who talked most) and falls back to keyword search.
"""
import logging
import re
from collections import Counter
from dataclasses import dataclass

from .. import models
from . import llm
from .summarizer import STOPWORDS
from .timeutils import format_timestamp

logger = logging.getLogger(__name__)

WORD = re.compile(r"[a-z0-9']+")


@dataclass
class Answer:
    text: str
    sources: list[models.TranscriptSegment]
    generated_by: str


def answer_question(meeting: models.Meeting, question: str) -> Answer:
    if llm.is_enabled() and meeting.segments:
        try:
            text, line_numbers = llm.answer_question(meeting.segments, question)
            sources = [meeting.segments[n] for n in line_numbers if 0 <= n < len(meeting.segments)]
            return Answer(text, sources, "llm")
        except Exception:
            logger.exception("LLM question answering failed; using rule-based answer")
    return _rule_based_answer(meeting, question)


def _rule_based_answer(meeting: models.Meeting, question: str) -> Answer:
    q = question.lower()

    if any(k in q for k in ("action item", "task", "todo", "to-do", "next step", "follow up")):
        if not meeting.action_items:
            return Answer("No action items were captured for this meeting.", [], "heuristic")
        lines = [
            f"- {'✓ ' if item.is_completed else ''}{item.text}"
            + (f" — {item.assignee}" if item.assignee else "")
            for item in meeting.action_items
        ]
        return Answer("Here are the action items from this meeting:\n" + "\n".join(lines), [], "heuristic")

    if any(k in q for k in ("summary", "summarize", "summarise", "overview", "recap", "tl;dr", "meeting about")):
        if meeting.summary:
            return Answer(meeting.summary.overview, [], "heuristic")

    if "who" in q and any(k in q for k in ("most", "talk", "spoke", "speak")):
        talk_time = Counter()
        for seg in meeting.segments:
            talk_time[seg.speaker] += seg.end_time - seg.start_time
        total = sum(talk_time.values()) or 1
        lines = [f"- {name}: {seconds / total:.0%}" for name, seconds in talk_time.most_common()]
        return Answer("Talk time by speaker:\n" + "\n".join(lines), [], "heuristic")

    return _keyword_answer(meeting, question)


def _keyword_answer(meeting: models.Meeting, question: str) -> Answer:
    terms = {w.rstrip("s") for w in WORD.findall(question.lower()) if len(w) > 2 and w not in STOPWORDS}
    if not terms:
        return Answer("Could you rephrase that with a few more specific keywords?", [], "heuristic")

    def score(segment: models.TranscriptSegment) -> int:
        words = {w.rstrip("s") for w in WORD.findall(segment.text.lower())}
        return len(terms & words)

    # Most relevant lines first (sorted() is stable, so ties stay in meeting order).
    ranked = sorted((s for s in meeting.segments if score(s) > 0), key=score, reverse=True)[:3]
    if not ranked:
        return Answer("I couldn't find anything about that in this meeting. Try different keywords.",
                      [], "heuristic")
    # The quotes themselves are returned as `sources`, which the UI shows as clickable cards.
    moments = ", ".join(f"{s.speaker} at {format_timestamp(s.start_time)}" for s in ranked)
    return Answer(f"I found {len(ranked)} relevant moment(s) in the transcript: {moments}.", ranked, "heuristic")

"""Rule-based meeting notes: overview, keywords, chapters (outline) and action items.

This is the default "AI" used when no LLM API key is configured, and the fallback if an
LLM call fails. It is intentionally simple and explainable:
  * keywords  -> the most frequent meaningful words (stop-words removed)
  * overview  -> extractive summary: the sentences that contain the most frequent words
  * chapters  -> the transcript cut into equal parts, each titled by its own top words
  * actions   -> sentences that match commitment phrases ("I'll", "can you", "by Friday"...)
"""
import re
from collections import Counter
from dataclasses import dataclass, field
from typing import Protocol

STOPWORDS = set(
    """a about above after again against all also am an and any are aren't as at be because been
    before being below between both but by can can't cannot could couldn't did didn't do does doesn't
    doing don't down during each few for from further had hadn't has hasn't have haven't having he
    he'd he'll he's her here here's hers herself him himself his how how's i i'd i'll i'm i've if in
    into is isn't it it's its itself let's me more most mustn't my myself no nor not of off on once
    only or other ought our ours ourselves out over own same shan't she she'd she'll she's should
    shouldn't so some such than that that's the their theirs them themselves then there there's these
    they they'd they'll they're they've this those through to too under until up very was wasn't we
    we'd we'll we're we've were weren't what what's when when's where where's which while who who's
    whom why why's will with won't would wouldn't you you'd you'll you're you've your yours yourself
    yourselves yeah yes okay ok oh um uh like really think know going get got right well actually
    maybe thing things lot something kind sort want need mean say said just sure good great thanks
    thank hi hello everyone guys today one two also make sounds sound look looks see now let us
    much many still even back way bit quick quickly last next first take give put come go doing
    done kicking anything everything else probably definitely already pretty start started
    perfect works takes agree agreed exactly absolutely cool awesome guess feel means keep part
    whole every across around able lots fair honestly basically three four five six seven eight
    nine ten eleven twelve fifteen twenty thirty forty fifty sixty hundred thousand percent joining
    joined meeting call hear morning afternoon went wanted""".split()
)

WORD = re.compile(r"[A-Za-z][A-Za-z'-]*")
SENTENCE_END = re.compile(r"(?<=[.!?])\s+")
ACTION_PHRASE = re.compile(
    r"\b(i'll|i will|i'm going to|i can take|we need to|can you|could you|please|action item|"
    r"follow up|follow-up|by (?:monday|tuesday|wednesday|thursday|friday|tomorrow|next week|"
    r"end of (?:the )?(?:day|week|month)))\b",
    re.IGNORECASE,
)
FIRST_PERSON = re.compile(r"\b(i'll|i will|i'm going to|i can take)\b", re.IGNORECASE)
REQUEST = re.compile(r"\b(can you|could you|please)\b", re.IGNORECASE)
FILLER_START = re.compile(r"^(so|okay|ok|alright|and|yeah|great|cool|perfect|sure),?\s+", re.IGNORECASE)


class SegmentLike(Protocol):
    """Anything with these attributes works: a ParsedSegment or a TranscriptSegment row."""

    speaker: str
    start_time: float
    text: str


@dataclass
class GeneratedChapter:
    title: str
    start_time: float
    summary: str


@dataclass
class GeneratedActionItem:
    text: str
    assignee: str | None
    timestamp: float | None


@dataclass
class GeneratedNotes:
    overview: str
    keywords: list[str]
    chapters: list[GeneratedChapter] = field(default_factory=list)
    action_items: list[GeneratedActionItem] = field(default_factory=list)
    generated_by: str = "heuristic"


@dataclass
class Sentence:
    speaker: str
    start_time: float
    text: str


def summarize_transcript(segments: list[SegmentLike]) -> GeneratedNotes:
    speakers = sorted({s.speaker for s in segments})
    name_words = {w.lower() for name in speakers for w in WORD.findall(name)}
    frequencies = Counter(w for s in segments for w in _content_words(s.text, name_words))
    sentences = _split_sentences(segments)
    display = _display_forms(segments)

    keywords = [display(word) for word, _ in frequencies.most_common(6)]
    return GeneratedNotes(
        overview=_overview(sentences, frequencies, keywords, name_words),
        keywords=keywords,
        chapters=_chapters(segments, frequencies, name_words, display),
        action_items=_action_items(sentences, speakers),
    )


def _content_words(text: str, exclude: set[str]) -> list[str]:
    words = (w.lower().strip("'-") for w in WORD.findall(text))
    return [w for w in words if len(w) > 2 and w not in STOPWORDS and w not in exclude]


def _display_forms(segments: list[SegmentLike]):
    """Returns a function giving each word its most common original casing ('sso' -> 'SSO')."""
    forms: dict[str, Counter] = {}
    for seg in segments:
        for token in WORD.findall(seg.text):
            token = token.strip("'-")
            forms.setdefault(token.lower(), Counter())[token] += 1

    def display(word: str) -> str:
        form = forms[word].most_common(1)[0][0] if word in forms else word
        return form[:1].upper() + form[1:]

    return display


def _split_sentences(segments: list[SegmentLike]) -> list[Sentence]:
    return [
        Sentence(seg.speaker, seg.start_time, part.strip())
        for seg in segments
        for part in SENTENCE_END.split(seg.text)
        if part.strip()
    ]


def _score(text: str, frequencies: Counter, exclude: set[str]) -> float:
    """Average frequency of a sentence's meaningful words — high = 'on topic'."""
    words = _content_words(text, exclude)
    if len(words) < 4:
        return 0.0
    return sum(frequencies[w] for w in words) / len(words)


def _overview(sentences: list[Sentence], frequencies: Counter, keywords: list[str],
              exclude: set[str]) -> str:
    ranked = sorted(sentences, key=lambda s: _score(s.text, frequencies, exclude), reverse=True)
    best, seen = [], set()
    for sentence in ranked:  # top 3 distinct statements (questions aren't summaries)
        if sentence.text.endswith("?") or sentence.text.lower() in seen:
            continue
        seen.add(sentence.text.lower())
        best.append(sentence)
        if len(best) == 3:
            break
    best.sort(key=lambda s: s.start_time)  # keep them in meeting order
    lines = []
    if keywords:
        topics = ", ".join(k.lower() for k in keywords[:3])
        lines.append(f"The discussion centered on {topics}.")
    lines += [f"{s.speaker}: {_clean(s.text)}" for s in best]
    return "\n".join(lines)


def _chapters(segments: list[SegmentLike], frequencies: Counter, exclude: set[str],
              display) -> list[GeneratedChapter]:
    count = max(1, min(5, len(segments) // 6))
    size = -(-len(segments) // count)  # ceiling division
    topics = [word for word, _ in frequencies.most_common(25)]  # the meeting's main topics
    chapters, used = [], set()
    for i in range(0, len(segments), size):
        chunk = segments[i:i + size]
        local = Counter(w for s in chunk for w in _content_words(s.text, exclude))
        # Title = the meeting-level topics this part talks about most (each topic used once).
        top = sorted((t for t in topics if local[t] and t not in used), key=lambda t: -local[t])[:2]
        used.update(top)
        best = max(chunk, key=lambda s: _score(s.text, frequencies, exclude))
        chapters.append(
            GeneratedChapter(
                title=" & ".join(display(t) for t in top) or f"Part {len(chapters) + 1}",
                start_time=chunk[0].start_time,
                summary=_truncate(_clean(best.text), 180),
            )
        )
    return chapters


def _action_items(sentences: list[Sentence], speakers: list[str]) -> list[GeneratedActionItem]:
    items, seen = [], set()
    for sentence in sentences:
        text = sentence.text
        if len(text.split()) < 5 or not ACTION_PHRASE.search(text):
            continue
        if text.endswith("?") and not REQUEST.search(text):
            continue  # an open question, not a task
        cleaned = _clean(text)
        if cleaned.lower() in seen:
            continue
        seen.add(cleaned.lower())
        items.append(GeneratedActionItem(_truncate(cleaned, 200), _assignee(sentence, speakers),
                                         sentence.start_time))
    return items[:8]


def _assignee(sentence: Sentence, speakers: list[str]) -> str | None:
    """'I'll do X' -> the speaker; 'Priya, can you do X' -> Priya; otherwise the speaker."""
    if FIRST_PERSON.search(sentence.text):
        return sentence.speaker
    lowered = sentence.text.lower()
    for name in speakers:
        if name != sentence.speaker and name.split()[0].lower() in lowered:
            return name
    return sentence.speaker


def _clean(text: str) -> str:
    text = FILLER_START.sub("", text.strip())
    return text[:1].upper() + text[1:]


def _truncate(text: str, limit: int) -> str:
    return text if len(text) <= limit else text[: limit - 1].rsplit(" ", 1)[0] + "…"

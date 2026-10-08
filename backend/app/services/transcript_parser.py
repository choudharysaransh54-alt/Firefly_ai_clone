"""Turns an uploaded/pasted transcript into a list of timed, speaker-labelled segments.

Supported formats (detected automatically):
  * WebVTT (.vtt) and SubRip (.srt)  — cue timings like "00:00:01.000 --> 00:00:04.000"
  * JSON (.json)                      — a list of {"speaker", "start", "end"?, "text"} objects
  * Plain text (.txt), one line per utterance, e.g.
        [00:01:23] Alice: Hello there
        00:01:23 Alice: Hello there
        Alice (01:23): Hello there
        Alice: Hello there            <- no times: they are estimated from speaking rate
"""
import json
import re
from dataclasses import dataclass

from .timeutils import parse_timestamp

WORDS_PER_SECOND = 2.5  # ~150 words per minute, a normal speaking pace
PAUSE_SECONDS = 1.0  # gap inserted between utterances when we have to estimate times

TIME = r"\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d+)?"
CUE_TIMING = re.compile(rf"^\s*({TIME})\s*-->\s*({TIME})")
TXT_TIME_FIRST = re.compile(rf"^\[?(?P<time>{TIME})\]?\s+(?P<speaker>[^:]{{1,60}}?):\s*(?P<text>.+)$")
TXT_SPEAKER_TIME = re.compile(rf"^(?P<speaker>[^:(\[]{{1,60}}?)\s*[(\[](?P<time>{TIME})[)\]]\s*:?\s*(?P<text>.+)$")
TXT_SPEAKER_ONLY = re.compile(r"^(?P<speaker>[^:]{1,60}?):\s*(?P<text>.+)$")
VTT_VOICE = re.compile(r"^<v\s+([^>]+)>(.*?)(?:</v>)?$")


@dataclass
class ParsedSegment:
    speaker: str
    start_time: float | None
    text: str
    end_time: float | None = None


def parse_transcript(content: str, filename: str | None = None) -> list[ParsedSegment]:
    """Detect the format, parse it, and fill in any missing start/end times."""
    content = content.strip().lstrip("﻿")
    if not content:
        raise ValueError("The transcript is empty.")

    extension = filename.rsplit(".", 1)[-1].lower() if filename and "." in filename else ""
    if extension == "json" or (content[0] in "[{" and _is_valid_json(content)):
        segments = _parse_json(content)
    elif extension in ("vtt", "srt") or content.startswith("WEBVTT") or "-->" in content:
        segments = _parse_cues(content)
    else:
        segments = _parse_text(content)

    segments = [s for s in segments if s.text.strip()]
    if not segments:
        raise ValueError("Could not find any transcript lines. Expected lines like 'Speaker: text'.")
    return _fill_times(segments)


def _is_valid_json(content: str) -> bool:
    # "[00:01] Alice: hi" also starts with "[", so only treat it as JSON if it really parses.
    try:
        json.loads(content)
        return True
    except ValueError:
        return False


def _parse_json(content: str) -> list[ParsedSegment]:
    try:
        data = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON transcript: {exc.msg}") from exc
    if isinstance(data, dict):
        data = data.get("segments") or data.get("transcript") or []
    if not isinstance(data, list):
        raise ValueError("JSON transcript must be a list of segments.")

    segments = []
    for item in data:
        if not isinstance(item, dict):
            continue
        start = item.get("start", item.get("start_time"))
        end = item.get("end", item.get("end_time"))
        segments.append(
            ParsedSegment(
                speaker=str(item.get("speaker") or item.get("speaker_name") or "Unknown speaker"),
                start_time=_to_seconds(start),
                end_time=_to_seconds(end),
                text=str(item.get("text") or "").strip(),
            )
        )
    return segments


def _parse_cues(content: str) -> list[ParsedSegment]:
    """Shared parser for WebVTT and SRT: both are blocks of 'timing line + text lines'."""
    segments = []
    for block in re.split(r"\n\s*\n", content.replace("\r\n", "\n")):
        lines = [line.strip() for line in block.splitlines() if line.strip()]
        timing_index = next((i for i, line in enumerate(lines) if CUE_TIMING.match(line)), None)
        if timing_index is None:
            continue  # "WEBVTT" header, NOTE blocks, etc.
        start, end = CUE_TIMING.match(lines[timing_index]).groups()
        text = " ".join(lines[timing_index + 1:])
        speaker, text = _split_speaker(text)
        segments.append(
            ParsedSegment(speaker=speaker, start_time=parse_timestamp(start),
                          end_time=parse_timestamp(end), text=text)
        )
    return _merge_consecutive(segments)


def _parse_text(content: str) -> list[ParsedSegment]:
    segments: list[ParsedSegment] = []
    for raw_line in content.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        match = TXT_TIME_FIRST.match(line) or TXT_SPEAKER_TIME.match(line)
        if match:
            segments.append(ParsedSegment(match["speaker"].strip(), parse_timestamp(match["time"]),
                                          match["text"].strip()))
            continue
        match = TXT_SPEAKER_ONLY.match(line)
        if match:
            segments.append(ParsedSegment(match["speaker"].strip(), None, match["text"].strip()))
        elif segments:
            segments[-1].text += " " + line  # a wrapped line continues the previous utterance
        else:
            segments.append(ParsedSegment("Unknown speaker", None, line))
    return segments


def _split_speaker(text: str) -> tuple[str, str]:
    """Pull the speaker out of '<v Alice>Hi' or 'Alice: Hi'."""
    voice = VTT_VOICE.match(text)
    if voice:
        return voice.group(1).strip(), voice.group(2).strip()
    plain = TXT_SPEAKER_ONLY.match(text)
    if plain:
        return plain["speaker"].strip(), plain["text"].strip()
    return "Unknown speaker", text


def _merge_consecutive(segments: list[ParsedSegment]) -> list[ParsedSegment]:
    """Caption files split sentences into many short cues; join cues from the same speaker."""
    merged: list[ParsedSegment] = []
    for seg in segments:
        if merged and merged[-1].speaker == seg.speaker and seg.speaker != "Unknown speaker":
            merged[-1].text += " " + seg.text
            merged[-1].end_time = seg.end_time
        else:
            merged.append(seg)
    return merged


def _fill_times(segments: list[ParsedSegment]) -> list[ParsedSegment]:
    """Make sure every segment has a start and end time, estimating any that are missing."""
    clock = 0.0
    for seg in segments:
        if seg.start_time is None:
            seg.start_time = clock
        clock = max(clock, seg.start_time) + _speaking_time(seg.text) + PAUSE_SECONDS

    for current, following in zip(segments, segments[1:] + [None]):
        estimated_end = current.start_time + _speaking_time(current.text)
        if current.end_time is None or current.end_time <= current.start_time:
            current.end_time = estimated_end
        if following is not None and current.end_time > following.start_time:
            current.end_time = max(current.start_time, following.start_time)
        current.start_time = round(current.start_time, 2)
        current.end_time = round(current.end_time, 2)
    return segments


def _speaking_time(text: str) -> float:
    return max(2.0, len(text.split()) / WORDS_PER_SECOND)


def _to_seconds(value) -> float | None:
    if value is None or value == "":
        return None
    if isinstance(value, (int, float)):
        return float(value)
    return parse_timestamp(str(value))

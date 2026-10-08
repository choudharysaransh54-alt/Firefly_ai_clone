"""Every file in /samples must keep working: valid ones parse (and import through the API),
invalid ones are rejected with a clear error."""
from pathlib import Path

import pytest

from app.services.summarizer import summarize_transcript
from app.services.transcript_parser import parse_transcript

SAMPLES_DIR = Path(__file__).resolve().parents[2] / "samples"
FORMATS = {".txt", ".vtt", ".srt", ".json"}
ALL_FILES = sorted(p for p in SAMPLES_DIR.rglob("*") if p.suffix in FORMATS)
VALID = [p for p in ALL_FILES if not p.name.startswith("invalid-")]
INVALID = [p for p in ALL_FILES if p.name.startswith("invalid-")]


def read(path: Path) -> str:
    # Decode the raw bytes (like the browser's file.text()) so CRLF line endings are kept.
    return path.read_bytes().decode("utf-8")


def parse(name: str):
    path = SAMPLES_DIR / name
    return parse_transcript(read(path), path.name)


@pytest.mark.parametrize("path", VALID, ids=lambda p: str(p.relative_to(SAMPLES_DIR)))
def test_valid_sample_parses_and_summarizes(path):
    segments = parse_transcript(read(path), path.name)
    assert segments
    assert all(s.text and s.end_time >= s.start_time for s in segments)
    assert [s.start_time for s in segments] == sorted(s.start_time for s in segments)
    assert summarize_transcript(segments).overview


@pytest.mark.parametrize("path", INVALID, ids=lambda p: p.name)
def test_invalid_sample_is_rejected(path):
    with pytest.raises(ValueError):
        parse_transcript(read(path), path.name)


@pytest.mark.parametrize("path", VALID, ids=lambda p: str(p.relative_to(SAMPLES_DIR)))
def test_valid_sample_imports_through_api(client, path):
    response = client.post(
        "/api/meetings",
        json={"title": path.stem, "transcript": read(path), "filename": path.name, "source": "upload"},
    )
    assert response.status_code == 201, response.text
    assert response.json()["segments"]


def test_long_meeting_passes_one_hour():
    segments = parse("all-hands-long.txt")
    assert len(segments) > 70
    assert segments[-1].start_time > 3600


def test_wrapped_lines_are_joined():
    segments = parse("edge-cases/wrapped-lines.txt")
    assert len(segments) == 3
    assert segments[0].text.endswith("onto a third line as well.")


def test_split_caption_cues_are_merged():
    segments = parse("edge-cases/split-cues.vtt")
    assert [s.speaker for s in segments] == ["Mia Wong", "Sam Lee", "Mia Wong"]
    assert segments[0].text == "So the thing I wanted to raise today is that our release checklist is getting way too long."


def test_missing_speaker_labels_become_unknown_speaker():
    segments = parse("edge-cases/no-speaker-labels.srt")
    assert {s.speaker for s in segments} == {"Unknown speaker"}
    assert len(segments) == 4  # cues from unknown speakers are not merged


def test_windows_line_endings_and_bom():
    segments = parse("edge-cases/windows-crlf-bom.txt")
    assert [s.speaker for s in segments] == ["Dana White", "Eli Brown", "Dana White", "Eli Brown"]
    assert not any("\r" in s.text for s in segments)


def test_unicode_speaker_names():
    speakers = {s.speaker for s in parse("edge-cases/unicode-names.txt")}
    assert speakers == {"José Álvarez", "Zoë Müller", "田中 由紀", "Ольга Петрова"}


def test_mixed_timestamps_keep_real_times():
    segments = parse("edge-cases/mixed-timestamps.txt")
    assert segments[0].start_time == 0
    assert segments[4].speaker == "Carla Diaz" and segments[4].start_time == 90
    assert 0 < segments[1].start_time < 90  # estimated from speaking speed


def test_json_alternative_keys():
    segments = parse("podcast-interview.json")
    assert segments[0].speaker == "Nadia Brooks"
    assert (segments[1].start_time, segments[1].end_time) == (15, 21)

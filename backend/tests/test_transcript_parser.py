import json

import pytest

from app.services.timeutils import format_timestamp, parse_timestamp
from app.services.transcript_parser import parse_transcript


def test_timestamps_round_trip():
    assert parse_timestamp("01:23") == 83
    assert parse_timestamp("1:01:23") == 3683
    assert parse_timestamp("00:00:05,500") == 5.5
    assert format_timestamp(83) == "01:23"
    assert format_timestamp(3683) == "1:01:23"


def test_plain_text_with_timestamps():
    segments = parse_transcript("[00:00] Alice: Hello there\n[00:07] Bob: Hi Alice\n(continued line)")
    assert [s.speaker for s in segments] == ["Alice", "Bob"]
    assert segments[1].start_time == 7
    assert segments[0].end_time <= segments[1].start_time
    assert segments[1].text == "Hi Alice (continued line)"


def test_plain_text_without_timestamps_estimates_times():
    segments = parse_transcript("Alice: one two three four five\nBob: six seven")
    assert segments[0].start_time == 0
    assert segments[1].start_time > segments[0].end_time  # a pause sits between utterances


def test_speaker_then_time_format():
    segments = parse_transcript("Alice (01:05): Let's begin")
    assert segments[0].speaker == "Alice"
    assert segments[0].start_time == 65


def test_webvtt_with_voice_tags_merges_consecutive_cues():
    vtt = """WEBVTT

00:00:01.000 --> 00:00:03.000
<v Alice>Hello everyone

00:00:03.000 --> 00:00:05.000
<v Alice>and welcome.

00:00:05.500 --> 00:00:08.000
<v Bob>Thanks!
"""
    segments = parse_transcript(vtt, "call.vtt")
    assert [s.speaker for s in segments] == ["Alice", "Bob"]
    assert segments[0].text == "Hello everyone and welcome."
    assert (segments[0].start_time, segments[0].end_time) == (1, 5)


def test_srt_with_speaker_prefix():
    srt = "1\n00:00:01,000 --> 00:00:02,000\nAlice: Hi\n\n2\n00:00:02,500 --> 00:00:04,000\nBob: Hey"
    segments = parse_transcript(srt, "call.srt")
    assert [(s.speaker, s.start_time) for s in segments] == [("Alice", 1), ("Bob", 2.5)]


def test_json_segments():
    data = [{"speaker": "Alice", "start": "00:10", "text": "Hi"}, {"speaker": "Bob", "start": 15, "text": "Hello"}]
    segments = parse_transcript(json.dumps(data), "call.json")
    assert [(s.speaker, s.start_time) for s in segments] == [("Alice", 10), ("Bob", 15)]


@pytest.mark.parametrize(
    ("bad_input", "filename"),
    [("   ", None), ("[1, 2, 3]", None), ("{not json", "call.json")],
)
def test_invalid_transcripts_raise_value_error(bad_input, filename):
    with pytest.raises(ValueError):
        parse_transcript(bad_input, filename)

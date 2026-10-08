# Sample transcripts

Upload any of these with **Upload** in the top bar (or **Uploads** in the sidebar), using the *Upload file* tab.
Every file here is also covered by an automated test (`backend/tests/test_samples.py`).

## Realistic meetings

| File | Format | What it shows |
|---|---|---|
| `sales-demo-call.txt` | Text, `[hh:mm:ss] Name: text` | 18-minute sales demo with 4 speakers: pilot, pricing, security review, clear action items |
| `all-hands-long.txt` | Text, `[hh:mm:ss] Name: text` | **Long meeting (1h 01m, 73 lines, 7 speakers).** Tests `h:mm:ss` timestamps, long scrolling, Q&A |
| `one-on-one.txt` | Text, `Name (mm:ss): text` | Manager 1:1 about growth and feedback |
| `design-brainstorm.txt` | Text, `Name: text` (**no timestamps**) | Times are estimated from speaking speed (~150 words/min) |
| `team-retro.txt` | Text, `Name: text` (no timestamps) | Sprint retrospective |
| `sprint-planning.vtt` | WebVTT with `<v Name>` voice tags | Short caption cues that get **merged** per speaker (19 cues → 15 lines) |
| `zoom-export.vtt` | WebVTT, numbered cues with `Name: text` | Looks like a Zoom transcript export |
| `product-sync.vtt` | WebVTT with `<v Name>` voice tags | Mobile beta product sync |
| `board-update.srt` | SRT with `Name: text` | Board meeting with finance numbers |
| `customer-call.srt` | SRT with `Name: text` | Customer check-in about an export bug |
| `support-escalation.json` | JSON array, numeric `start` / `end` seconds | Incident call with many action items |
| `podcast-interview.json` | JSON object `{"segments": [...]}` with `speaker_name`, `start_time`, `end_time` as `mm:ss` | Alternative JSON key names |
| `standup.json` | JSON array, `start` as `mm:ss` | Daily standup |

## Edge cases (`edge-cases/`)

| File | Expected result |
|---|---|
| `wrapped-lines.txt` | Lines without a speaker are joined onto the previous utterance → 3 lines |
| `split-cues.vtt` | 4 tiny cues from the same speaker merge into one sentence |
| `no-speaker-labels.srt` | No names in the captions → every line is "Unknown speaker" |
| `generic-speaker-labels.txt` | `Speaker 1/2/3` labels, `00:00:03 Name: text` format (no brackets) |
| `unicode-names.txt` | Names like José Álvarez, Zoë Müller, 田中 由紀, Ольга Петрова |
| `mixed-timestamps.txt` | Some lines timed, some not → missing times are estimated between the real ones |
| `windows-crlf-bom.txt` | Windows line endings (CRLF) + UTF-8 byte-order mark, like a file saved in Notepad |
| `invalid-broken.json` | ❌ Rejected: "Invalid JSON transcript …" |
| `invalid-no-segments.json` | ❌ Rejected: "Could not find any transcript lines …" |
| `invalid-empty.txt` | ❌ Rejected: "The transcript is empty." |

The invalid files should show a red error toast in the upload modal, and no meeting is created.

## Stress testing

`make_long_transcript.py` generates a random transcript of any length (same output every run):

```bash
python samples/make_long_transcript.py 1000 > long-meeting.txt     # 1,000 lines, about 2.5 hours
python samples/make_long_transcript.py 20000 > too-large.txt       # about 2.6 MB, over the 2 MB upload limit
```

The first is good for checking that the transcript and player stay smooth with many lines: tested with 2,000 lines,
playback stays around 50 fps. The second should be rejected by the upload modal with a "larger than 2 MB" message.

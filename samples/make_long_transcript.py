"""Generate a long, random transcript to stress-test the parser and the transcript UI.

Usage:
    python samples/make_long_transcript.py 1000 > long-meeting.txt     # 1,000 lines, about 2.5 hours
    python samples/make_long_transcript.py 20000 > too-large.txt       # about 2.6 MB, over the 2 MB upload limit
"""
import random
import sys

SPEAKERS = ["Alex Johnson", "Maria Garcia", "Wei Zhang", "Fatima Khan", "Lucas Martin", "Emma Wilson"]
SENTENCES = [
    "Let's look at the numbers for this quarter.",
    "I think we should prioritize the onboarding improvements.",
    "Customers keep asking about the integration with their CRM.",
    "The latest release fixed most of the performance issues.",
    "Can you share the dashboard after the call?",
    "I'll follow up with the design team tomorrow.",
    "We need to decide on the launch date by Friday.",
    "The support backlog is down twenty percent since last month.",
    "Hiring for the data team is taking longer than expected.",
    "That's a good point, let's add it to the agenda for next week.",
    "Our biggest risk is the dependency on the payments provider.",
    "I'll write up a proposal and send it to everyone.",
]


def timestamp(seconds: float) -> str:
    total = int(seconds)
    return f"{total // 3600:02d}:{total % 3600 // 60:02d}:{total % 60:02d}"


def main(line_count: int) -> None:
    random.seed(42)  # same output every time
    clock = 0.0
    for _ in range(line_count):
        speaker = random.choice(SPEAKERS)
        text = " ".join(random.sample(SENTENCES, k=random.randint(1, 3)))
        print(f"[{timestamp(clock)}] {speaker}: {text}")
        clock += len(text.split()) / 2.5 + random.uniform(0.5, 3.0)


if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 1500)

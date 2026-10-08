from app.services.summarizer import summarize_transcript
from app.services.transcript_parser import parse_transcript

TRANSCRIPT = """
Alice: Today we need to decide on the pricing page redesign and the launch date.
Bob: The pricing page redesign is mostly done. The pricing tiers just need final copy.
Alice: Great. Bob, can you send the final pricing copy to legal by Friday?
Bob: Sure. I'll also update the pricing screenshots for the launch blog post.
Carol: For the launch, marketing needs two weeks of lead time for the campaign.
Alice: Then let's target the launch for the end of the month.
"""


def test_heuristic_notes_have_all_sections():
    notes = summarize_transcript(parse_transcript(TRANSCRIPT))
    assert notes.generated_by == "heuristic"
    assert "Pricing" in notes.keywords
    assert notes.overview
    assert notes.chapters and notes.chapters[0].start_time == 0


def test_action_items_pick_the_right_owner():
    notes = summarize_transcript(parse_transcript(TRANSCRIPT))
    by_text = {item.text: item.assignee for item in notes.action_items}
    # "Bob, can you send..." is asked by Alice but assigned to Bob.
    assert by_text["Bob, can you send the final pricing copy to legal by Friday?"] == "Bob"
    # "I'll also update..." is a commitment by the speaker.
    assert by_text["I'll also update the pricing screenshots for the launch blog post."] == "Bob"

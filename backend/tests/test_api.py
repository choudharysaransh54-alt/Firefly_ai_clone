"""End-to-end API tests against a temporary, freshly seeded SQLite database."""

TRANSCRIPT = (
    "[00:00] Alice: Welcome to the budget review.\n"
    "[00:05] Bob: The marketing budget is over by ten percent.\n"
    "[00:12] Alice: Bob, can you send a revised budget by Friday?\n"
)


def create_meeting(client, **overrides):
    payload = {"title": "Budget Review", "participants": ["Dana"], "tags": ["Finance"],
               "transcript": TRANSCRIPT, **overrides}
    response = client.post("/api/meetings", json=payload)
    assert response.status_code == 201, response.text
    return response.json()


def test_seeded_meetings_are_listed_newest_first(client):
    meetings = client.get("/api/meetings").json()
    assert len(meetings) >= 7
    dates = [m["started_at"] for m in meetings]
    assert dates == sorted(dates, reverse=True)
    assert client.get("/api/meetings", params={"sort": "oldest"}).json()[0]["started_at"] == min(dates)


def test_filters(client):
    by_title = client.get("/api/meetings", params={"q": "debrief"}).json()
    assert [m["title"] for m in by_title] == ["Hiring Debrief: Senior Backend Engineer"]

    by_transcript_text = client.get("/api/meetings", params={"q": "zendesk"}).json()
    assert [m["title"] for m in by_transcript_text] == ["Globex Quarterly Business Review"]

    by_person = client.get("/api/meetings", params={"participant": "Grace Liu"}).json()
    assert all(any(p["name"] == "Grace Liu" for p in m["participants"]) for m in by_person)
    assert len(by_person) == 1

    by_tag = client.get("/api/meetings", params={"tag": "Customer"}).json()
    assert len(by_tag) == 2


def test_create_meeting_from_pasted_transcript(client):
    meeting = create_meeting(client)
    assert [s["speaker"] for s in meeting["segments"]] == ["Alice", "Bob", "Alice"]
    assert {p["name"] for p in meeting["participants"]} == {"Alice", "Bob", "Dana"}
    assert meeting["summary"]["generated_by"] == "heuristic"
    assert any(item["assignee"] == "Bob" for item in meeting["action_items"])
    assert meeting["duration_seconds"] > 12


def test_create_meeting_rejects_unparseable_transcript(client):
    response = client.post("/api/meetings", json={"title": "Bad", "transcript": "{oops", "filename": "bad.json"})
    assert response.status_code == 422


def test_update_meeting_metadata(client):
    meeting = create_meeting(client)
    response = client.patch(f"/api/meetings/{meeting['id']}",
                            json={"title": "Q3 Budget Review", "participants": ["Alice", "Eve"]})
    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "Q3 Budget Review"
    assert [p["name"] for p in body["participants"]] == ["Alice", "Eve"]
    assert len(body["segments"]) == 3  # transcript untouched


def test_action_item_crud(client):
    meeting = create_meeting(client)
    created = client.post(f"/api/meetings/{meeting['id']}/action-items",
                          json={"text": "Book the venue", "assignee": "Alice"}).json()
    assert created["is_completed"] is False

    updated = client.patch(f"/api/action-items/{created['id']}", json={"is_completed": True}).json()
    assert updated["is_completed"] is True and updated["text"] == "Book the venue"

    assert client.delete(f"/api/action-items/{created['id']}").status_code == 204
    assert client.patch(f"/api/action-items/{created['id']}", json={"text": "x"}).status_code == 404


def test_delete_meeting_cascades(client):
    meeting = create_meeting(client)
    segment_id = meeting["segments"][0]["id"]
    client.post(f"/api/segments/{segment_id}/comments", json={"body": "Nice point"})

    assert client.delete(f"/api/meetings/{meeting['id']}").status_code == 204
    assert client.get(f"/api/meetings/{meeting['id']}").status_code == 404
    # The comment's segment is gone too, so commenting on it now 404s.
    assert client.post(f"/api/segments/{segment_id}/comments", json={"body": "?"}).status_code == 404


def test_comments(client):
    meeting = create_meeting(client)
    segment_id = meeting["segments"][1]["id"]
    comment = client.post(f"/api/segments/{segment_id}/comments", json={"body": "Ouch"}).json()
    assert comment["author_name"] == "Jordan Rivera"

    detail = client.get(f"/api/meetings/{meeting['id']}").json()
    assert detail["segments"][1]["comments"][0]["body"] == "Ouch"
    assert client.delete(f"/api/comments/{comment['id']}").status_code == 204


def test_global_search_groups_by_meeting(client):
    results = client.get("/api/search", params={"q": "Okta"}).json()["results"]
    assert results
    for result in results:
        assert all("okta" in match["text"].lower() for match in result["matches"])


def test_export_markdown_and_text(client):
    meeting = create_meeting(client)
    md = client.get(f"/api/meetings/{meeting['id']}/export", params={"format": "md"})
    assert md.status_code == 200
    assert md.text.startswith("# Budget Review")
    assert "attachment" in md.headers["content-disposition"]

    txt = client.get(f"/api/meetings/{meeting['id']}/export", params={"format": "txt"})
    assert "[00:05] Bob: The marketing budget is over by ten percent." in txt.text


def test_ask_fred(client):
    meeting = create_meeting(client)
    answer = client.post(f"/api/meetings/{meeting['id']}/ask", json={"question": "What about marketing budget?"}).json()
    assert answer["generated_by"] == "heuristic"
    assert answer["sources"][0]["speaker"] == "Bob"

    tasks = client.post(f"/api/meetings/{meeting['id']}/ask", json={"question": "What are the action items?"}).json()
    assert "revised budget" in tasks["answer"]


def test_regenerate_summary_keeps_action_items(client):
    meeting = create_meeting(client)
    client.post(f"/api/meetings/{meeting['id']}/action-items", json={"text": "Manual task"})
    refreshed = client.post(f"/api/meetings/{meeting['id']}/summary").json()
    assert any(item["text"] == "Manual task" for item in refreshed["action_items"])
    assert refreshed["summary"]["overview"]


def test_open_action_items_across_meetings(client):
    items = client.get("/api/action-items", params={"status": "open"}).json()
    assert items and all(not item["is_completed"] for item in items)
    assert all(item["meeting_title"] for item in items)

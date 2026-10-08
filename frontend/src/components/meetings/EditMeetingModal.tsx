"use client";

import { useState, type FormEvent } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { toDateTimeLocal } from "@/lib/format";
import type { MeetingDetail, MeetingListItem } from "@/lib/types";
import { Button } from "../ui/Button";
import { ChipInput } from "../ui/ChipInput";
import { Field, inputClass } from "../ui/Field";
import { Modal } from "../ui/Modal";
import { useToast } from "../ui/Toast";

/** Edit a meeting's title, date, participants and tags. Render it only while open
 *  so the form state starts fresh from the meeting each time. */
export function EditMeetingModal({
  meeting,
  onClose,
  onSaved,
}: {
  meeting: MeetingListItem;
  onClose: () => void;
  onSaved: (meeting: MeetingDetail) => void;
}) {
  const toast = useToast();
  const { data: people } = useSWR("participants", api.listParticipants);
  const { data: tags } = useSWR("tags", api.listTags);

  const [title, setTitle] = useState(meeting.title);
  const [startedAt, setStartedAt] = useState(toDateTimeLocal(new Date(meeting.started_at)));
  const [participants, setParticipants] = useState(meeting.participants.map((p) => p.name));
  const [tagNames, setTagNames] = useState(meeting.tags.map((t) => t.name));
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateMeeting(meeting.id, { title: title.trim(), started_at: startedAt, participants, tags: tagNames });
      onSaved(updated);
      toast.success("Meeting details updated");
      onClose();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit meeting details"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="edit-meeting-form" disabled={!title.trim() || saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </>
      }
    >
      <form id="edit-meeting-form" onSubmit={onSubmit} className="space-y-4">
        <Field label="Title">
          <input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} />
        </Field>
        <Field label="Date & time">
          <input type="datetime-local" value={startedAt} onChange={(event) => setStartedAt(event.target.value)} className={inputClass} />
        </Field>
        <Field label="Participants">
          <ChipInput values={participants} onChange={setParticipants} placeholder="Add a participant" suggestions={people?.map((p) => p.name)} />
        </Field>
        <Field label="Tags">
          <ChipInput values={tagNames} onChange={setTagNames} placeholder="Add a tag" suggestions={tags?.map((t) => t.name)} />
        </Field>
      </form>
    </Modal>
  );
}

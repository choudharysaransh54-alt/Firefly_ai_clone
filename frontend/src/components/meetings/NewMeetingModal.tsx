"use client";

import { ClipboardPaste, FileText, Mic, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type DragEvent, type FormEvent } from "react";
import useSWR, { useSWRConfig } from "swr";
import { api } from "@/lib/api";
import { toDateTimeLocal } from "@/lib/format";
import { Button } from "../ui/Button";
import { ChipInput } from "../ui/ChipInput";
import { ComingSoonBadge } from "../ui/ComingSoon";
import { Field, inputClass } from "../ui/Field";
import { Modal } from "../ui/Modal";
import { useToast } from "../ui/Toast";

type Mode = "upload" | "paste";

const MAX_FILE_BYTES = 2_000_000;

const SAMPLE_TRANSCRIPT = `[00:00] Alex Johnson: Thanks for joining, everyone. Let's review the beta launch checklist.
[00:06] Mia Wong: The onboarding emails are ready. I'll schedule them for Monday morning.
[00:14] Sam Lee: The billing page still has a bug with annual plans. I'll fix it before Friday.
[00:22] Alex Johnson: Great. Mia, can you also prepare the launch announcement for the blog?
[00:29] Mia Wong: Yes, I'll draft it tomorrow and share it with the team for review.
[00:36] Sam Lee: We need to double check the pricing page copy with legal before launch.
[00:44] Alex Johnson: Good point. Let's aim to launch the beta on the fifteenth if billing is fixed.`;

/** Create a meeting by uploading a transcript file or pasting text, plus basic details. */
export function NewMeetingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const { mutate } = useSWRConfig();
  // Only fetch suggestions once the modal is actually open (a null key skips the request).
  const { data: people } = useSWR(open ? "participants" : null, api.listParticipants);
  const { data: tags } = useSWR(open ? "tags" : null, api.listTags);

  const [mode, setMode] = useState<Mode>("upload");
  const [title, setTitle] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [transcript, setTranscript] = useState("");
  const [filename, setFilename] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  function close() {
    setMode("upload");
    setTitle("");
    setStartedAt("");
    setParticipants([]);
    setTagNames([]);
    setTranscript("");
    setFilename(null);
    onClose();
  }

  async function readFile(file: File) {
    if (file.size > MAX_FILE_BYTES) {
      toast.error("That file is larger than 2 MB. Try pasting the transcript instead.");
      return;
    }
    setTranscript(await file.text());
    setFilename(file.name);
    if (!title) {
      // "product-sync.vtt" -> "Product sync"
      const name = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
      setTitle(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) readFile(file);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const meeting = await api.createMeeting({
        title: title.trim(),
        started_at: startedAt || undefined,
        participants,
        tags: tagNames,
        transcript,
        filename: mode === "upload" ? (filename ?? undefined) : undefined,
        source: mode,
      });
      // Refresh every cached meetings list (keys look like ["meetings", filters]).
      mutate((key) => Array.isArray(key) && key[0] === "meetings");
      toast.success("Meeting created — Fred has written your notes");
      close();
      router.push(`/meetings/${meeting.id}`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const canSubmit = title.trim() && transcript.trim() && !saving;

  return (
    <Modal
      open={open}
      onClose={close}
      title="Upload a meeting"
      description="Add a transcript and Fred will generate a summary, outline and action items."
      width="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" form="new-meeting-form" disabled={!canSubmit}>
            {saving ? "Generating notes…" : "Create meeting"}
          </Button>
        </>
      }
    >
      <form id="new-meeting-form" onSubmit={onSubmit} className="space-y-5">
        <div className="flex items-center gap-2 rounded-lg bg-surface-hover p-2.5 text-xs text-fg-muted">
          <Mic size={14} className="shrink-0" />
          <span className="flex-1">Audio/video transcription isn&apos;t available yet — upload or paste a transcript.</span>
          <ComingSoonBadge />
        </div>

        <div className="inline-flex rounded-lg border border-line p-0.5">
          {(["upload", "paste"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
                mode === value ? "bg-brand-soft text-brand-text" : "text-fg-muted hover:text-fg"
              }`}
            >
              {value === "upload" ? <UploadCloud size={15} /> : <ClipboardPaste size={15} />}
              {value === "upload" ? "Upload file" : "Paste transcript"}
            </button>
          ))}
        </div>

        {mode === "upload" ? (
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
              dragging ? "border-brand bg-brand-soft" : "border-line hover:border-brand"
            }`}
          >
            {filename ? (
              <>
                <FileText size={28} className="mb-2 text-brand" />
                <p className="text-sm font-medium">{filename}</p>
                <p className="mt-1 text-xs text-fg-muted">
                  {transcript.split("\n").filter(Boolean).length} lines · click to choose another file
                </p>
              </>
            ) : (
              <>
                <UploadCloud size={28} className="mb-2 text-brand" />
                <p className="text-sm font-medium">Drag & drop a transcript, or click to browse</p>
                <p className="mt-1 text-xs text-fg-muted">.txt, .vtt, .srt or .json — up to 2 MB</p>
              </>
            )}
            <input
              type="file"
              accept=".txt,.vtt,.srt,.json,text/plain,application/json"
              className="hidden"
              onChange={(event) => event.target.files?.[0] && readFile(event.target.files[0])}
            />
          </label>
        ) : (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium">Transcript</span>
              <button
                type="button"
                className="text-xs font-medium text-brand hover:underline"
                onClick={() => {
                  setTranscript(SAMPLE_TRANSCRIPT);
                  if (!title) setTitle("Beta Launch Checklist");
                }}
              >
                Use a sample transcript
              </button>
            </div>
            <textarea
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              rows={9}
              placeholder={"[00:00] Alice: Welcome everyone…\n[00:05] Bob: Thanks! First item…\n\nAlso accepts “Name: text” lines, WebVTT, SRT or JSON."}
              className="w-full rounded-lg border border-line bg-surface p-3 font-mono text-xs leading-relaxed outline-none placeholder:text-fg-subtle focus:border-brand"
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Meeting title">
            <input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} placeholder="Weekly sync" />
          </Field>
          <Field label="Date & time" hint="Leave empty to use the current time">
            <input
              type="datetime-local"
              value={startedAt}
              max={toDateTimeLocal(new Date())}
              onChange={(event) => setStartedAt(event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Participants" hint="Speakers found in the transcript are added automatically">
          <ChipInput values={participants} onChange={setParticipants} placeholder="Type a name and press Enter" suggestions={people?.map((p) => p.name)} />
        </Field>
        <Field label="Tags">
          <ChipInput values={tagNames} onChange={setTagNames} placeholder="e.g. Sales, Planning" suggestions={tags?.map((t) => t.name)} />
        </Field>
      </form>
    </Modal>
  );
}

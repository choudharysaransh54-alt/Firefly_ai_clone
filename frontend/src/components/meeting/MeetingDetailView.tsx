"use client";

import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { usePlayer } from "@/hooks/usePlayer";
import { useSpeechPlayback } from "@/hooks/useSpeechPlayback";
import { api } from "@/lib/api";
import type { ActionItem, MeetingDetail, Segment } from "@/lib/types";
import { EditMeetingModal } from "../meetings/EditMeetingModal";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { EmptyState, ErrorState, Spinner } from "../ui/States";
import { useToast } from "../ui/Toast";
import { MeetingHeader } from "./MeetingHeader";
import { NotesPanel } from "./NotesPanel";
import { PlayerBar } from "./PlayerBar";
import { TranscriptPanel } from "./TranscriptPanel";

type MeetingChange = (change: (meeting: MeetingDetail) => MeetingDetail) => void;

/** Loads the meeting, then shows the workspace. */
export function MeetingDetailView({ meetingId, initialTime }: { meetingId: number; initialTime: number }) {
  const { data: meeting, error, mutate } = useSWR(["meeting", meetingId], () => api.getMeeting(meetingId));

  // Apply a local change to the cached meeting without refetching (the API already saved it).
  const updateMeeting = useCallback<MeetingChange>(
    (change) => mutate((current) => current && change(current), { revalidate: false }),
    [mutate],
  );

  if (error) {
    return error.message === "Meeting not found" ? (
      <EmptyState
        icon={FileQuestion}
        title="Meeting not found"
        description="It may have been deleted."
        action={
          <Link href="/meetings" className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-surface-hover">
            Back to meetings
          </Link>
        }
      />
    ) : (
      <ErrorState message={error.message} />
    );
  }
  if (!meeting) return <Spinner label="Loading meeting…" />;
  return <MeetingWorkspace meeting={meeting} initialTime={initialTime} updateMeeting={updateMeeting} />;
}

/** Index of the line being spoken at `time` (the last line that started at or before it). */
function findActiveIndex(segments: Segment[], time: number): number {
  let index = -1;
  for (let i = 0; i < segments.length && segments[i].start_time <= time; i++) index = i;
  return index;
}

function MeetingWorkspace({
  meeting,
  initialTime,
  updateMeeting,
}: {
  meeting: MeetingDetail;
  initialTime: number;
  updateMeeting: MeetingChange;
}) {
  const router = useRouter();
  const toast = useToast();
  const { mutate: mutateCache } = useSWRConfig();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const player = usePlayer(meeting.duration_seconds, initialTime);
  const { seek, play, togglePlay, skip } = player;
  const activeIndex = useMemo(() => findActiveIndex(meeting.segments, player.currentTime), [meeting.segments, player.currentTime]);

  // Sound: the browser reads the active line aloud while the player is playing.
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const { supported: voiceSupported } = useSpeechPlayback({
    segments: meeting.segments,
    activeIndex,
    isPlaying: player.isPlaying,
    speed: player.speed,
    seekCount: player.seekCount,
    getCurrentTime: player.getCurrentTime,
    enabled: voiceEnabled,
  });

  // Clicking a line, outline entry, action item or AskFred source: jump there and play.
  const seekAndPlay = useCallback(
    (time: number) => {
      seek(time);
      play();
    },
    [seek, play],
  );

  // Keyboard shortcuts: Space = play/pause, ← / → = skip 5 seconds (ignored while typing).
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.target as HTMLElement).closest("input, textarea, select, button, a")) return;
      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      } else if (event.key === "ArrowRight") skip(5);
      else if (event.key === "ArrowLeft") skip(-5);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePlay, skip]);

  const updateItems = useCallback(
    (change: (items: ActionItem[]) => ActionItem[]) =>
      updateMeeting((m) => {
        const items = change(m.action_items);
        return { ...m, action_items: items, open_action_items: items.filter((i) => !i.is_completed).length };
      }),
    [updateMeeting],
  );

  const updateSegmentComments = useCallback(
    (segmentId: number, change: (segment: Segment) => Segment["comments"]) =>
      updateMeeting((m) => ({
        ...m,
        segments: m.segments.map((s) => (s.id === segmentId ? { ...s, comments: change(s) } : s)),
      })),
    [updateMeeting],
  );

  const addComment = useCallback(
    async (segmentId: number, body: string) => {
      try {
        const comment = await api.addComment(segmentId, body);
        updateSegmentComments(segmentId, (s) => [...s.comments, comment]);
        toast.success("Comment added");
      } catch (error) {
        toast.error((error as Error).message);
      }
    },
    [updateSegmentComments, toast],
  );

  const deleteComment = useCallback(
    async (segmentId: number, commentId: number) => {
      try {
        await api.deleteComment(commentId);
        updateSegmentComments(segmentId, (s) => s.comments.filter((c) => c.id !== commentId));
        toast.success("Comment deleted");
      } catch (error) {
        toast.error((error as Error).message);
      }
    },
    [updateSegmentComments, toast],
  );

  async function deleteMeeting() {
    try {
      await api.deleteMeeting(meeting.id);
      mutateCache((key) => Array.isArray(key) && key[0] === "meetings");
      toast.success(`Deleted “${meeting.title}”`);
      router.push("/meetings");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <MeetingHeader meeting={meeting} onEdit={() => setEditing(true)} onDelete={() => setConfirmingDelete(true)} />

      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:overflow-hidden">
        <section className="border-line bg-surface lg:min-h-0 lg:overflow-y-auto lg:border-r">
          <NotesPanel
            meeting={meeting}
            currentTime={player.currentTime}
            onSeek={seekAndPlay}
            onMeetingChange={(updated) => updateMeeting(() => updated)}
            onItemsChange={updateItems}
          />
        </section>
        <section className="min-h-[60vh] border-t border-line bg-surface lg:min-h-0 lg:border-t-0">
          <TranscriptPanel
            segments={meeting.segments}
            activeIndex={activeIndex}
            onSeek={seekAndPlay}
            onAddComment={addComment}
            onDeleteComment={deleteComment}
          />
        </section>
      </div>

      <PlayerBar
        player={player}
        segments={meeting.segments}
        activeSpeaker={meeting.segments[activeIndex]?.speaker ?? null}
        voice={{ enabled: voiceEnabled, supported: voiceSupported, onToggle: () => setVoiceEnabled((on) => !on) }}
      />

      {editing && (
        <EditMeetingModal
          meeting={meeting}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            updateMeeting(() => updated);
            mutateCache((key) => Array.isArray(key) && key[0] === "meetings");
          }}
        />
      )}
      <ConfirmDialog
        open={confirmingDelete}
        title="Delete meeting?"
        message={`“${meeting.title}” and its transcript, notes, action items and comments will be permanently deleted.`}
        onConfirm={deleteMeeting}
        onClose={() => setConfirmingDelete(false)}
      />
    </div>
  );
}

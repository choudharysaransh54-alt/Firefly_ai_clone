"use client";

import { MessageSquare, MessageSquarePlus, Trash2 } from "lucide-react";
import { memo, useState, type FormEvent } from "react";
import { formatTimestamp } from "@/lib/format";
import type { Segment } from "@/lib/types";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Highlight } from "../ui/Highlight";

interface TranscriptLineProps {
  segment: Segment;
  isActive: boolean;
  query: string;
  isCurrentMatch: boolean;
  onSeek: (time: number) => void;
  onAddComment: (segmentId: number, body: string) => Promise<void>;
  onDeleteComment: (segmentId: number, commentId: number) => Promise<void>;
  registerLine: (segmentId: number, element: HTMLDivElement | null) => void;
}

/** One transcript line. memo() avoids re-rendering every line on each player tick. */
export const TranscriptLine = memo(function TranscriptLine({
  segment,
  isActive,
  query,
  isCurrentMatch,
  onSeek,
  onAddComment,
  onDeleteComment,
  registerLine,
}: TranscriptLineProps) {
  const [commenting, setCommenting] = useState(false);
  const [draft, setDraft] = useState("");

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    await onAddComment(segment.id, draft.trim());
    setDraft("");
    setCommenting(false);
  }

  return (
    <div
      ref={(element) => registerLine(segment.id, element)}
      className={`group relative flex gap-3 rounded-xl border-l-[3px] px-3 py-2.5 transition-colors ${
        isActive ? "border-brand bg-brand-soft" : "border-transparent hover:bg-surface-hover"
      }`}
    >
      <Avatar name={segment.speaker} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{segment.speaker}</span>
          <button
            type="button"
            onClick={() => onSeek(segment.start_time)}
            className="text-xs tabular-nums text-fg-subtle hover:text-brand"
          >
            {formatTimestamp(segment.start_time)}
          </button>
          {segment.comments.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-brand">
              <MessageSquare size={12} /> {segment.comments.length}
            </span>
          )}
          <button
            type="button"
            aria-label="Comment on this line"
            title="Comment"
            onClick={() => setCommenting((value) => !value)}
            className="ml-auto rounded-md p-1 text-fg-subtle opacity-0 transition-opacity hover:bg-surface hover:text-brand focus:opacity-100 group-hover:opacity-100"
          >
            <MessageSquarePlus size={15} />
          </button>
        </div>

        <p onClick={() => onSeek(segment.start_time)} className="mt-0.5 cursor-pointer text-sm leading-relaxed text-fg">
          <Highlight text={segment.text} query={query} active={isCurrentMatch} />
        </p>

        {segment.comments.map((comment) => (
          <div key={comment.id} className="group/comment mt-2 flex items-start gap-2 rounded-lg border border-line bg-surface p-2">
            <Avatar name={comment.author_name} size="xs" />
            <div className="min-w-0 flex-1 text-xs">
              <span className="font-semibold">{comment.author_name}</span>
              <p className="mt-0.5 text-fg-muted">{comment.body}</p>
            </div>
            <button
              type="button"
              aria-label="Delete comment"
              onClick={() => onDeleteComment(segment.id, comment.id)}
              className="text-fg-subtle opacity-0 hover:text-danger group-hover/comment:opacity-100"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        {commenting && (
          <form onSubmit={submitComment} className="mt-2 flex gap-2">
            <input
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => event.key === "Escape" && setCommenting(false)}
              placeholder="Add a comment…"
              className="h-8 flex-1 rounded-lg border border-line bg-surface px-2.5 text-xs outline-none focus:border-brand"
            />
            <Button type="submit" size="sm" disabled={!draft.trim()}>
              Comment
            </Button>
          </form>
        )}
      </div>
    </div>
  );
});

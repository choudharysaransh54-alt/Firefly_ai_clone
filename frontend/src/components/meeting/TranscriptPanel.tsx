"use client";

import { ChevronDown, ChevronUp, LocateFixed, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Segment } from "@/lib/types";
import { IconButton } from "../ui/Button";
import { TranscriptLine } from "./TranscriptLine";

interface TranscriptPanelProps {
  segments: Segment[];
  activeIndex: number;
  onSeek: (time: number) => void;
  onAddComment: (segmentId: number, body: string) => Promise<void>;
  onDeleteComment: (segmentId: number, commentId: number) => Promise<void>;
}

/**
 * Interactive transcript.
 *  - player -> transcript: the active line is highlighted and kept in view (auto-scroll)
 *  - transcript -> player: clicking a line or its timestamp seeks the player
 *  - search: highlights matches and steps through them with ↑ / ↓
 */
export function TranscriptPanel({ segments, activeIndex, onSeek, onAddComment, onDeleteComment }: TranscriptPanelProps) {
  const [query, setQuery] = useState("");
  const [matchCursor, setMatchCursor] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const lineElements = useRef(new Map<number, HTMLDivElement>());

  const matchIds = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? segments.filter((s) => s.text.toLowerCase().includes(needle)).map((s) => s.id) : [];
  }, [segments, query]);
  const currentMatchId = matchIds[matchCursor] ?? null;
  const activeId = segments[activeIndex]?.id ?? null;

  // Each line registers its DOM element here so we can scroll to it.
  const registerLine = useCallback((id: number, element: HTMLDivElement | null) => {
    if (element) lineElements.current.set(id, element);
    else lineElements.current.delete(id);
  }, []);

  const scrollToLine = useCallback((id: number | null) => {
    if (id !== null) lineElements.current.get(id)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  // Follow the player while auto-scroll is on (and the user isn't searching).
  // Line 0 is already visible on load, so only scroll once playback has moved past it.
  useEffect(() => {
    if (autoScroll && !query && activeIndex > 0) scrollToLine(activeId);
  }, [activeId, activeIndex, autoScroll, query, scrollToLine]);

  // Jump to the selected search match.
  useEffect(() => {
    scrollToLine(currentMatchId);
  }, [currentMatchId, scrollToLine]);

  function stepMatch(direction: 1 | -1) {
    if (matchIds.length) setMatchCursor((cursor) => (cursor + direction + matchIds.length) % matchIds.length);
  }

  const seekAndFollow = useCallback(
    (time: number) => {
      setAutoScroll(true);
      onSeek(time);
    },
    [onSeek],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold">Transcript</h2>
        <div className="relative ml-auto w-full max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setMatchCursor(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") stepMatch(event.shiftKey ? -1 : 1);
              if (event.key === "Escape") setQuery("");
            }}
            placeholder="Search transcript"
            aria-label="Search transcript"
            className="h-8 w-full rounded-lg border border-line bg-surface pl-8 pr-20 text-sm outline-none placeholder:text-fg-subtle focus:border-brand"
          />
          {query && (
            <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
              <span className="px-1 text-[11px] tabular-nums text-fg-muted">
                {matchIds.length ? `${matchCursor + 1}/${matchIds.length}` : "0/0"}
              </span>
              <button type="button" aria-label="Previous match" onClick={() => stepMatch(-1)} className="text-fg-muted hover:text-fg">
                <ChevronUp size={15} />
              </button>
              <button type="button" aria-label="Next match" onClick={() => stepMatch(1)} className="text-fg-muted hover:text-fg">
                <ChevronDown size={15} />
              </button>
              <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="text-fg-muted hover:text-fg">
                <X size={14} />
              </button>
            </div>
          )}
        </div>
        {!autoScroll && (
          <IconButton aria-label="Follow playback" title="Follow playback" onClick={() => setAutoScroll(true)} className="text-brand">
            <LocateFixed size={17} />
          </IconButton>
        )}
      </div>

      {/* Any manual scroll pauses auto-scroll so the transcript doesn't fight the user. */}
      <div
        className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-3"
        onWheel={() => autoScroll && setAutoScroll(false)}
        onTouchMove={() => autoScroll && setAutoScroll(false)}
      >
        {segments.map((segment) => (
          <TranscriptLine
            key={segment.id}
            segment={segment}
            isActive={segment.id === activeId}
            query={query}
            isCurrentMatch={segment.id === currentMatchId}
            onSeek={seekAndFollow}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
            registerLine={registerLine}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { colorForName, formatDuration, formatTimestamp } from "@/lib/format";
import type { Segment } from "@/lib/types";
import { Avatar } from "../ui/Avatar";

interface SpeakerStat {
  name: string;
  talkSeconds: number;
  turns: number;
  words: number;
}

/** Speaker analytics computed from the transcript: talk time share, turns and pace. */
export function SpeakerStats({ segments, duration }: { segments: Segment[]; duration: number }) {
  const stats = useMemo(() => {
    const byName = new Map<string, SpeakerStat>();
    for (const segment of segments) {
      const stat = byName.get(segment.speaker) ?? { name: segment.speaker, talkSeconds: 0, turns: 0, words: 0 };
      stat.talkSeconds += segment.end_time - segment.start_time;
      stat.turns += 1;
      stat.words += segment.text.split(/\s+/).length;
      byName.set(segment.speaker, stat);
    }
    return [...byName.values()].sort((a, b) => b.talkSeconds - a.talkSeconds);
  }, [segments]);

  const totalTalk = stats.reduce((sum, s) => sum + s.talkSeconds, 0) || 1;
  const totalWords = stats.reduce((sum, s) => sum + s.words, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Duration", formatDuration(duration)],
          ["Speakers", String(stats.length)],
          ["Words", totalWords.toLocaleString()],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line p-3">
            <p className="text-xs text-fg-muted">{label}</p>
            <p className="mt-1 text-lg font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Talk time</h3>
        <ul className="space-y-4">
          {stats.map((stat) => {
            const share = stat.talkSeconds / totalTalk;
            const wordsPerMinute = Math.round(stat.words / Math.max(stat.talkSeconds / 60, 0.01));
            return (
              <li key={stat.name} className="flex items-center gap-3">
                <Avatar name={stat.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate font-medium">{stat.name}</span>
                    <span className="tabular-nums text-fg-muted">{Math.round(share * 100)}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-hover">
                    <div className="h-full rounded-full" style={{ width: `${share * 100}%`, backgroundColor: colorForName(stat.name) }} />
                  </div>
                  <p className="mt-1 text-xs text-fg-subtle">
                    {formatTimestamp(stat.talkSeconds)} talk time · {stat.turns} turns · {wordsPerMinute} words/min
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

"use client";

import { BarChart3, FileText, Sparkles } from "lucide-react";
import { useState } from "react";
import type { ActionItem, MeetingDetail } from "@/lib/types";
import { AskFred } from "./AskFred";
import { SpeakerStats } from "./SpeakerStats";
import { SummaryTab } from "./SummaryTab";

type Tab = "summary" | "ask" | "speakers";

const TABS = [
  { id: "summary" as const, label: "Summary", icon: FileText },
  { id: "ask" as const, label: "AskFred", icon: Sparkles },
  { id: "speakers" as const, label: "Speakers", icon: BarChart3 },
];

interface NotesPanelProps {
  meeting: MeetingDetail;
  currentTime: number;
  onSeek: (time: number) => void;
  onMeetingChange: (meeting: MeetingDetail) => void;
  onItemsChange: (change: (items: ActionItem[]) => ActionItem[]) => void;
}

/** Left side of the meeting page. All tabs stay mounted (just hidden) so the AskFred chat keeps its history. */
export function NotesPanel({ meeting, currentTime, onSeek, onMeetingChange, onItemsChange }: NotesPanelProps) {
  const [tab, setTab] = useState<Tab>("summary");

  return (
    <div>
      <div className="sticky top-0 z-10 flex gap-1 border-b border-line bg-surface px-4 pt-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1.5 text-sm font-medium ${
              tab === id ? "border-brand text-brand-text" : "border-transparent text-fg-muted hover:text-fg"
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className="px-5 py-5 md:px-6">
        <div hidden={tab !== "summary"}>
          <SummaryTab
            meeting={meeting}
            currentTime={currentTime}
            onSeek={onSeek}
            onMeetingChange={onMeetingChange}
            onItemsChange={onItemsChange}
          />
        </div>
        <div hidden={tab !== "ask"}>
          <AskFred meetingId={meeting.id} onSeek={onSeek} />
        </div>
        <div hidden={tab !== "speakers"}>
          <SpeakerStats segments={meeting.segments} duration={meeting.duration_seconds} />
        </div>
      </div>
    </div>
  );
}

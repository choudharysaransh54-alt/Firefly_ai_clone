import { ClipboardPaste, FileUp, Video } from "lucide-react";
import type { MeetingSource } from "@/lib/types";

const SOURCES: Record<MeetingSource, { label: string; className: string }> = {
  google_meet: { label: "Google Meet", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  zoom: { label: "Zoom", className: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" },
  teams: { label: "Microsoft Teams", className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" },
  upload: { label: "Uploaded file", className: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  paste: { label: "Pasted transcript", className: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
};

export function sourceLabel(source: MeetingSource): string {
  return SOURCES[source]?.label ?? source;
}

/** Colored tile showing where a meeting came from (Zoom, Meet, upload...). */
export function SourceIcon({ source, size = 40 }: { source: MeetingSource; size?: number }) {
  const { label, className } = SOURCES[source] ?? SOURCES.upload;
  const Icon = source === "upload" ? FileUp : source === "paste" ? ClipboardPaste : Video;
  return (
    <span title={label} className={`inline-flex shrink-0 items-center justify-center rounded-xl ${className}`} style={{ width: size, height: size }}>
      <Icon size={size * 0.45} />
    </span>
  );
}

"use client";

import { Search, X } from "lucide-react";
import type { Participant, Tag } from "@/lib/types";

export type DatePreset = "any" | "today" | "7d" | "30d" | "custom";

export interface FilterState {
  search: string;
  datePreset: DatePreset;
  customFrom: string;
  customTo: string;
  participant: string;
  tag: string;
  sort: "newest" | "oldest";
}

export const EMPTY_FILTERS: FilterState = {
  search: "",
  datePreset: "any",
  customFrom: "",
  customTo: "",
  participant: "",
  tag: "",
  sort: "newest",
};

const selectClass =
  "h-9 rounded-lg border border-line bg-surface px-2.5 text-sm text-fg outline-none focus:border-brand";

interface MeetingFiltersProps {
  value: FilterState;
  onChange: (value: FilterState) => void;
  participants: Participant[];
  tags: Tag[];
}

/** Search box + date / participant / tag / sort controls for the meetings library. */
export function MeetingFilters({ value, onChange, participants, tags }: MeetingFiltersProps) {
  const set = <K extends keyof FilterState>(key: K, next: FilterState[K]) => onChange({ ...value, [key]: next });
  const isFiltered =
    value.search || value.datePreset !== "any" || value.participant || value.tag || value.sort !== "newest";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-56 flex-1">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
        <input
          value={value.search}
          onChange={(event) => set("search", event.target.value)}
          placeholder="Search by title, participant or keyword"
          aria-label="Search meetings"
          className="h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm outline-none placeholder:text-fg-subtle focus:border-brand"
        />
      </div>

      <select aria-label="Date" value={value.datePreset} onChange={(e) => set("datePreset", e.target.value as DatePreset)} className={selectClass}>
        <option value="any">Any date</option>
        <option value="today">Today</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="custom">Custom range…</option>
      </select>
      {value.datePreset === "custom" && (
        <>
          <input type="date" aria-label="From" value={value.customFrom} onChange={(e) => set("customFrom", e.target.value)} className={selectClass} />
          <span className="text-xs text-fg-subtle">to</span>
          <input type="date" aria-label="To" value={value.customTo} onChange={(e) => set("customTo", e.target.value)} className={selectClass} />
        </>
      )}

      <select aria-label="Participant" value={value.participant} onChange={(e) => set("participant", e.target.value)} className={selectClass}>
        <option value="">All participants</option>
        {participants.map((p) => (
          <option key={p.id} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>

      <select aria-label="Tag" value={value.tag} onChange={(e) => set("tag", e.target.value)} className={selectClass}>
        <option value="">All tags</option>
        {tags.map((t) => (
          <option key={t.id} value={t.name}>
            {t.name}
          </option>
        ))}
      </select>

      <select aria-label="Sort" value={value.sort} onChange={(e) => set("sort", e.target.value as FilterState["sort"])} className={selectClass}>
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>

      {isFiltered && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm text-fg-muted hover:bg-surface-hover hover:text-fg"
        >
          <X size={14} /> Clear
        </button>
      )}
    </div>
  );
}

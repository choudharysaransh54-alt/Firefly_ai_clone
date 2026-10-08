"use client";

import { Download, ExternalLink, ListChecks, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { downloadMeetingExport } from "@/lib/api";
import { formatDuration, formatTime } from "@/lib/format";
import type { MeetingListItem } from "@/lib/types";
import { AvatarStack } from "../ui/Avatar";
import { IconButton } from "../ui/Button";
import { Menu, MenuItem } from "../ui/Menu";
import { SourceIcon, sourceLabel } from "../ui/SourceIcon";
import { TagChip } from "../ui/TagChip";

interface MeetingRowProps {
  meeting: MeetingListItem;
  onEdit?: () => void;
  onDelete?: () => void;
}

/** One meeting in a list: icon, title + meta, tags, open tasks, people and an actions menu. */
export function MeetingRow({ meeting, onEdit, onDelete }: MeetingRowProps) {
  const router = useRouter();
  const href = `/meetings/${meeting.id}`;

  return (
    <div className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-hover">
      <SourceIcon source={meeting.source} />
      <Link href={href} className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold group-hover:text-brand">{meeting.title}</p>
        <p className="mt-0.5 text-xs text-fg-muted">
          {formatTime(meeting.started_at)} · {formatDuration(meeting.duration_seconds)} · {sourceLabel(meeting.source)}
        </p>
        {meeting.overview_snippet && <p className="mt-1 truncate text-xs text-fg-subtle">{meeting.overview_snippet}</p>}
      </Link>

      <div className="hidden shrink-0 gap-1 xl:flex">
        {meeting.tags.map((tag) => (
          <TagChip key={tag.id} tag={tag} />
        ))}
      </div>
      {meeting.open_action_items > 0 && (
        <span
          title="Open action items"
          className="hidden shrink-0 items-center gap-1 rounded-md bg-surface-hover px-2 py-1 text-xs text-fg-muted sm:inline-flex"
        >
          <ListChecks size={13} /> {meeting.open_action_items}
        </span>
      )}
      <div className="hidden shrink-0 md:block">
        <AvatarStack names={meeting.participants.map((p) => p.name)} />
      </div>

      {onEdit && onDelete && (
        <Menu
          trigger={(toggle) => (
            <IconButton aria-label="Meeting actions" onClick={toggle}>
              <MoreHorizontal size={18} />
            </IconButton>
          )}
        >
          {(close) => (
            <>
              <MenuItem icon={<ExternalLink size={16} />} onClick={() => router.push(href)}>
                Open
              </MenuItem>
              <MenuItem
                icon={<Pencil size={16} />}
                onClick={() => {
                  close();
                  onEdit();
                }}
              >
                Edit details
              </MenuItem>
              <MenuItem
                icon={<Download size={16} />}
                onClick={() => {
                  close();
                  downloadMeetingExport(meeting.id, "md");
                }}
              >
                Download notes
              </MenuItem>
              <MenuItem
                icon={<Trash2 size={16} />}
                danger
                onClick={() => {
                  close();
                  onDelete();
                }}
              >
                Delete
              </MenuItem>
            </>
          )}
        </Menu>
      )}
    </div>
  );
}

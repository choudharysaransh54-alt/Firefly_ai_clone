"use client";

import { ArrowLeft, CalendarDays, ChevronDown, Clock, Download, FileText, MoreHorizontal, Pencil, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { downloadMeetingExport } from "@/lib/api";
import { formatDate, formatDuration, formatTime } from "@/lib/format";
import type { MeetingDetail } from "@/lib/types";
import { AvatarStack } from "../ui/Avatar";
import { Button, IconButton } from "../ui/Button";
import { Menu, MenuItem } from "../ui/Menu";
import { SourceIcon, sourceLabel } from "../ui/SourceIcon";
import { TagChip } from "../ui/TagChip";
import { useToast } from "../ui/Toast";

interface MeetingHeaderProps {
  meeting: MeetingDetail;
  onEdit: () => void;
  onDelete: () => void;
}

export function MeetingHeader({ meeting, onEdit, onDelete }: MeetingHeaderProps) {
  const toast = useToast();
  const download = (format: "md" | "txt") => downloadMeetingExport(meeting.id, format);

  return (
    <header className="shrink-0 border-b border-line bg-surface px-4 py-4 md:px-6">
      <Link href="/meetings" className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-fg-muted hover:text-brand">
        <ArrowLeft size={14} /> Meetings
      </Link>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold lg:truncate">{meeting.title}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-fg-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} /> {formatDate(meeting.started_at)}, {formatTime(meeting.started_at)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} /> {formatDuration(meeting.duration_seconds)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <SourceIcon source={meeting.source} size={18} /> {sourceLabel(meeting.source)}
            </span>
            {meeting.tags.map((tag) => (
              <TagChip key={tag.id} tag={tag} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AvatarStack names={meeting.participants.map((p) => p.name)} max={5} />
          <Button variant="secondary" size="sm" onClick={() => toast.info("Sharing & team collaboration are coming soon")}>
            <Share2 size={14} /> Share
          </Button>
          <Menu
            trigger={(toggle) => (
              <Button variant="secondary" size="sm" onClick={toggle}>
                <Download size={14} /> Export <ChevronDown size={14} />
              </Button>
            )}
          >
            {(close) => (
              <>
                <MenuItem icon={<FileText size={16} />} onClick={() => { close(); download("md"); }}>
                  Markdown (.md)
                </MenuItem>
                <MenuItem icon={<FileText size={16} />} onClick={() => { close(); download("txt"); }}>
                  Plain text (.txt)
                </MenuItem>
              </>
            )}
          </Menu>
          <Menu
            trigger={(toggle) => (
              <IconButton aria-label="More actions" onClick={toggle}>
                <MoreHorizontal size={18} />
              </IconButton>
            )}
          >
            {(close) => (
              <>
                <MenuItem icon={<Pencil size={16} />} onClick={() => { close(); onEdit(); }}>
                  Edit details
                </MenuItem>
                <MenuItem icon={<Trash2 size={16} />} danger onClick={() => { close(); onDelete(); }}>
                  Delete meeting
                </MenuItem>
              </>
            )}
          </Menu>
        </div>
      </div>
    </header>
  );
}

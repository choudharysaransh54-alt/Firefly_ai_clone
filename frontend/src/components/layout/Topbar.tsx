"use client";

import { Bell, Video, Search, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { useToast } from "../ui/Toast";
import { CaptureModal } from "./CaptureModal";

export function Topbar({ onUpload }: { onUpload: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const { data: user } = useSWR("me", api.getMe);
  const [query, setQuery] = useState("");
  const [captureOpen, setCaptureOpen] = useState(false);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  const getPageTitle = () => {
    if (pathname === "/") return "Home";
    if (pathname.startsWith("/askfred")) return "AskFred";
    if (pathname.startsWith("/meetings")) return "Meetings";
    if (pathname.startsWith("/tasks")) return "Tasks";
    if (pathname.startsWith("/skills")) return "AI Skills";
    if (pathname.startsWith("/analytics")) return "Analytics";
    if (pathname.startsWith("/voice")) return "Voice Agents";
    if (pathname.startsWith("/upgrade")) return "Upgrade";
    if (pathname.startsWith("/integrations")) return "Integrations";
    if (pathname.startsWith("/settings")) return "Settings";
    if (pathname.startsWith("/team")) return "Team";
    return "";
  };

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#262629] bg-[#1e1e1f] px-4 md:px-6 relative z-10 select-none">
      {/* Left: Page Title */}
      <div className="flex items-center min-w-[100px]">
        <h1 className="text-[13px] font-medium text-white tracking-tight">{getPageTitle()}</h1>
      </div>

      {/* Middle: Centered Search Bar */}
      <div className="flex-1 max-w-sm mx-4 hidden sm:block">
        <form onSubmit={onSearch} className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title or keyword"
            aria-label="Search meetings"
            className="h-8 w-full rounded-md border border-[#27272a] bg-[#131314] pl-9 pr-14 text-xs text-white outline-none placeholder:text-[#71717a] focus:border-[#6938ef] transition-colors"
          />
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-[#202024] px-1.5 py-0.5 text-[10px] font-medium text-[#71717a]">
            Ctrl + K
          </div>
        </form>
      </div>

      {/* Right: Credits, Notifications, Capture */}
      <div className="flex items-center gap-3">
        {/* Free meetings counter */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs">
          <span className="flex items-center justify-center bg-[#22c55e] w-3.5 h-3.5 rounded-[3px] text-[9px] text-black font-extrabold shrink-0">
            3
          </span>
          <span className="text-[#8e8ea0] font-normal">Free meetings</span>
          <Link
            href="/upgrade"
            className="font-medium text-[#22c55e] hover:underline ml-1"
          >
            Upgrade
          </Link>
        </div>

        {/* Notifications Bell */}
        <button
          type="button"
          onClick={() => toast.info("You have no new notifications 🎉")}
          aria-label="Notifications"
          className="p-1.5 text-[#8e8ea0] hover:text-white hover:bg-[#252528] rounded-lg transition-colors"
        >
          <Bell size={16} />
        </button>

        {/* Purple Capture Button */}
        <button
          type="button"
          onClick={() => setCaptureOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-[#6938ef] hover:bg-[#5b32cc] px-3 py-1.5 text-xs font-semibold text-white transition-colors shadow-sm"
        >
          <Video size={14} />
          <span>Capture</span>
          <ChevronDown size={13} className="opacity-80" />
        </button>
      </div>

      <CaptureModal open={captureOpen} onClose={() => setCaptureOpen(false)} onUpload={onUpload} />
    </header>
  );
}

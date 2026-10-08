"use client";

import { useState } from "react";
import { 
  Search, 
  Hash, 
  Inbox, 
  Bot, 
  Upload, 
  Plus, 
  SlidersHorizontal, 
  Sparkles, 
  Check, 
  Target, 
  Pin, 
  Mic, 
  ArrowUp, 
  Layers, 
  X,
  Maximize2
} from "lucide-react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { useOpenNewMeeting } from "@/components/layout/AppShell";
import { useToast } from "@/components/ui/Toast";
import { SlackLogo, GmailLogo } from "@/components/ui/BrandIcons";
import { MeetingRow } from "@/components/meetings/MeetingRow";

export default function MeetingsPage() {
  const toast = useToast();
  const openNewMeeting = useOpenNewMeeting();
  const { data: user } = useSWR("me", api.getMe);
  const { data: meetings, mutate } = useSWR(["meetings", "all"], () => api.listMeetings());
  
  const [activeChannel, setActiveChannel] = useState<"my" | "all" | "voice" | "uploads">("my");
  const [filterTab, setFilterTab] = useState<"hosted" | "shared" | "all">("hosted");
  const [channelSearch, setChannelSearch] = useState("");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const displayName = user?.name?.split(" ")[0] || "Saransh";

  return (
    <div className="flex h-full w-full bg-[#131314] text-white select-none overflow-hidden">
      
      {/* 1. Left Secondary Sidebar: Channels & Folders (Exact match to Image 3) */}
      <aside className="w-[230px] shrink-0 border-r border-[#262629] bg-[#161618] flex flex-col justify-between py-3 px-3">
        <div>
          {/* Channel Search Input */}
          <div className="relative mb-3">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717a]" />
            <input
              value={channelSearch}
              onChange={(e) => setChannelSearch(e.target.value)}
              placeholder="Search channels"
              className="h-8 w-full rounded-md border border-[#27272a] bg-[#1a1a1d] pl-8 pr-2.5 text-xs text-white placeholder:text-[#71717a] outline-none focus:border-[#6938ef] transition-colors"
            />
          </div>

          {/* Core Channel Nav */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveChannel("my")}
              className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 text-xs rounded-lg transition-colors font-medium text-left ${
                activeChannel === "my"
                  ? "bg-[#251846] text-white border border-[#43267d]"
                  : "text-[#d1d5db] hover:bg-[#25252a]"
              }`}
            >
              <Hash size={14} className="text-[#a78bfa] shrink-0" />
              <span>My Meetings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChannel("all")}
              className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 text-xs rounded-lg transition-colors font-medium text-left ${
                activeChannel === "all"
                  ? "bg-[#251846] text-white border border-[#43267d]"
                  : "text-[#8e8ea0] hover:text-white hover:bg-[#25252a]"
              }`}
            >
              <Inbox size={14} className="shrink-0" />
              <span>All Meetings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChannel("voice")}
              className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 text-xs rounded-lg transition-colors font-medium text-left ${
                activeChannel === "voice"
                  ? "bg-[#251846] text-white border border-[#43267d]"
                  : "text-[#8e8ea0] hover:text-white hover:bg-[#25252a]"
              }`}
            >
              <Bot size={14} className="shrink-0" />
              <span>Voice Agent Meetings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChannel("uploads")}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 text-xs rounded-lg transition-colors font-medium text-left ${
                activeChannel === "uploads"
                  ? "bg-[#251846] text-white border border-[#43267d]"
                  : "text-[#8e8ea0] hover:text-white hover:bg-[#25252a]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Upload size={14} className="shrink-0" />
                <span>Uploads</span>
              </div>
              <span className="text-[9px] font-bold tracking-wider text-[#22c55e] bg-[#0c2e1b] border border-[#164e2d] px-1 py-0.2 rounded">
                NEW
              </span>
            </button>
          </div>

          {/* All Channels Empty Section */}
          <div className="mt-8 pt-4 border-t border-[#232328]">
            <p className="text-[11px] font-medium text-[#71717a] px-2 mb-4">All channels</p>
            
            <div className="px-2 py-4 flex flex-col items-center text-center">
              <Hash size={24} className="text-[#a78bfa] mb-2.5 opacity-80" />
              <p className="text-xs text-[#d1d5db] leading-relaxed mb-3">
                Create channels to organize your conversations
              </p>
              <button
                type="button"
                onClick={() => toast.info("Create new channel")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#323238] hover:border-[#6938ef] text-xs text-white hover:bg-[#222226] transition-colors"
              >
                <Plus size={13} />
                <span>Channel</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Middle: Meetings Content List or Empty State */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#131314] border-r border-[#262629]">
        {/* Top Filters Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#232328]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterTab("hosted")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filterTab === "hosted"
                  ? "bg-[#25252a] text-white border border-[#3b3b42]"
                  : "text-[#8e8ea0] hover:text-white hover:bg-[#1e1e22]"
              }`}
            >
              Hosted by me
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("shared")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filterTab === "shared"
                  ? "bg-[#25252a] text-white border border-[#3b3b42]"
                  : "text-[#8e8ea0] hover:text-white hover:bg-[#1e1e22]"
              }`}
            >
              Shared with me
            </button>
            <button
              type="button"
              onClick={() => toast.info("Filter settings")}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-[#8e8ea0] hover:text-white hover:bg-[#1e1e22] border border-[#27272a] transition-colors"
            >
              <SlidersHorizontal size={13} />
              <span>Filters</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => toast.info("Search meetings")}
            className="p-1.5 text-[#8e8ea0] hover:text-white hover:bg-[#202024] rounded-lg transition-colors"
          >
            <Search size={16} />
          </button>
        </div>

        {/* Meeting items or empty state */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center items-center">
          {meetings && meetings.length > 0 ? (
            <div className="w-full max-w-2xl space-y-2.5 my-auto">
              {meetings.map((m) => (
                <MeetingRow
                  key={m.id}
                  meeting={m}
                  onDelete={async () => {
                    await api.deleteMeeting(m.id);
                    await mutate();
                  }}
                  onEdit={() => {}}
                />
              ))}
            </div>
          ) : (
            /* Exact Empty State from Image 3 */
            <div className="flex flex-col items-center text-center max-w-sm">
              {/* Three Mockup Conversation Bubble Cards */}
              <div className="w-64 space-y-2 mb-6 opacity-75">
                <div className="rounded-xl border border-[#27272a] bg-[#1a1a1d] p-3 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-[#3b3b42] text-[11px] font-bold text-white flex items-center justify-center shrink-0">K</span>
                  <div className="h-2 w-32 rounded bg-[#2b2b32]" />
                </div>
                <div className="rounded-xl border border-[#27272a] bg-[#1a1a1d] p-3 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-[#4f46e5]/40 text-[11px] font-bold text-[#c7d2fe] flex items-center justify-center shrink-0">A</span>
                  <div className="h-2 w-40 rounded bg-[#2b2b32]" />
                </div>
                <div className="rounded-xl border border-[#27272a] bg-[#1a1a1d] p-3 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-[#059669]/40 text-[11px] font-bold text-[#a7f3d0] flex items-center justify-center shrink-0">R</span>
                  <div className="h-2 w-28 rounded bg-[#2b2b32]" />
                </div>
              </div>

              <h2 className="text-base font-semibold text-white mb-2">
                Looks like you haven&apos;t recorded a meeting yet
              </h2>
              <p className="text-xs text-[#8e8ea0] leading-relaxed mb-6">
                Once you record your first meeting with Fireflies, it&apos;ll show up right here.
              </p>

              <button
                type="button"
                onClick={openNewMeeting}
                className="flex items-center gap-2 rounded-lg bg-[#6938ef] hover:bg-[#5b32cc] px-4 py-2 text-xs font-semibold text-white transition-colors shadow-sm"
              >
                <Plus size={15} />
                <span>Capture</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 3. Right: Ask Fred Assistant Panel (Exact match to Image 3) */}
      <aside className="w-[320px] shrink-0 bg-[#161618] flex flex-col justify-between border-l border-[#262629] select-none">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#232328]">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-[#a78bfa]" />
              <span className="text-xs font-semibold text-white">Ask Fred</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#8e8ea0]">
              <button type="button" className="p-1 hover:text-white transition-colors" title="Expand">
                <Maximize2 size={13} />
              </button>
              <button type="button" className="p-1 hover:text-white transition-colors" title="New thread">
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Integration Banner (Slack + Gmail) */}
          {!bannerDismissed && (
            <div className="m-3 rounded-xl border border-[#31255a] bg-[#1a1636] p-3 relative shadow-sm">
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                className="absolute top-2.5 right-2.5 text-[#71717a] hover:text-white transition-colors"
                aria-label="Dismiss banner"
              >
                <X size={12} />
              </button>

              <div className="flex items-center gap-1.5 mb-2">
                <SlackLogo className="w-4 h-4 shrink-0" />
                <GmailLogo className="w-4 h-4 shrink-0" />
              </div>

              <p className="text-xs text-white font-medium leading-snug pr-4">
                Connect Slack and Gmail — get answers with full context.
              </p>

              <button
                type="button"
                onClick={() => toast.info("Connecting Slack and Gmail...")}
                className="mt-2 text-xs font-semibold text-[#a78bfa] hover:text-[#c4b5fd] transition-colors block text-right w-full"
              >
                Connect
              </button>
            </div>
          )}

          {/* Welcome & Prompt Suggestions */}
          <div className="px-4 py-3 space-y-4">
            <div>
              <Sparkles size={18} className="text-[#10b981] mb-2" />
              <h3 className="text-sm font-bold text-white">Hi {displayName}!</h3>
              <p className="text-xs text-[#8e8ea0] mt-0.5">Get ready for your meeting</p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setChatInput("List my action items")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#202024] hover:bg-[#28282e] border border-[#2b2b32] text-left text-xs text-white transition-colors"
              >
                <Check size={14} className="text-[#22c55e] shrink-0" />
                <span>My action items</span>
              </button>

              <button
                type="button"
                onClick={() => setChatInput("What were the key decisions?")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#202024] hover:bg-[#28282e] border border-[#2b2b32] text-left text-xs text-white transition-colors"
              >
                <Target size={14} className="text-[#f43f5e] shrink-0" />
                <span>Key decisions</span>
              </button>

              <button
                type="button"
                onClick={() => setChatInput("Summarize key initiatives")}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#202024] hover:bg-[#28282e] border border-[#2b2b32] text-left text-xs text-white transition-colors"
              >
                <Pin size={14} className="text-[#ec4899] shrink-0" />
                <span>Key initiatives</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Chat Input inside AskFred Panel */}
        <div className="p-3 border-t border-[#232328]">
          <div className="rounded-xl border border-[#2c2c34] bg-[#1a1a1d] p-2.5 focus-within:border-[#6938ef] transition-colors">
            {/* Active context pill */}
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#251846] border border-[#43267d] text-[10px] text-[#c4b5fd] font-medium mb-1.5">
              <span># My Meetings</span>
            </div>

            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && chatInput.trim()) {
                  toast.success(`Fred answered: "Indexed 10+ meetings for ${displayName}."`);
                  setChatInput("");
                }
              }}
              placeholder="Ask anything. Type / to run AI skills."
              className="w-full bg-transparent text-xs text-white placeholder:text-[#71717a] outline-none mb-2"
            />

            <div className="flex items-center justify-between pt-1 border-t border-[#232328]">
              <div className="flex items-center gap-1 text-[#8e8ea0]">
                <button type="button" onClick={() => toast.info("Add attachment")} className="p-1 hover:text-white transition-colors">
                  <Plus size={14} />
                </button>
                <button type="button" onClick={() => toast.info("Connectors")} className="p-1 hover:text-white transition-colors">
                  <Layers size={14} />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => toast.info("Voice input")} className="p-1 text-[#8e8ea0] hover:text-white transition-colors">
                  <Mic size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (chatInput.trim()) {
                      toast.success(`Fred answered: "Indexed 10+ meetings for ${displayName}."`);
                      setChatInput("");
                    }
                  }}
                  className="w-6 h-6 rounded-md bg-[#6938ef] hover:bg-[#5b32cc] flex items-center justify-center text-white transition-colors"
                >
                  <ArrowUp size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

    </div>
  );
}

"use client";

import { useState } from "react";
import { 
  Video, 
  Settings, 
  Bell, 
  Sparkles, 
  Radio, 
  Book, 
  Code, 
  Shield, 
  Gift, 
  User, 
  Lock, 
  Search, 
  MessageSquare, 
  Crown, 
  Sun, 
  Moon, 
  ChevronDown, 
  X, 
  ArrowRight,
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { applyTheme } from "@/lib/theme";
import { Avatar } from "@/components/ui/Avatar";
import { inputClass } from "@/components/ui/Field";
import { GmailLogo } from "@/components/ui/BrandIcons";
import { GmailProfileAvatar } from "@/components/layout/GmailProfileAvatar";

type SettingsTab = 
  | "recording"
  | "appearance"
  | "compliance"
  | "email"
  | "ai"
  | "live"
  | "knowledge"
  | "api"
  | "cookies"
  | "refer"
  | "account"
  | "security";

export default function SettingsPage() {
  const toast = useToast();
  const { data: user } = useSWR("me", api.getMe);
  const [activeTab, setActiveTab] = useState<SettingsTab>("recording");
  const [scope, setScope] = useState<"personal" | "team">("personal");
  const [searchQuery, setSearchQuery] = useState("");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Recording settings state
  const [autoRecord, setAutoRecord] = useState(true);
  const [recordScope, setRecordScope] = useState("Record only meetings I host");
  const [captureVideo, setCaptureVideo] = useState(false);
  const [meetingLang, setMeetingLang] = useState("English (Global)");
  const [autoDelete, setAutoDelete] = useState(false);

  const navItemClass = (tab: SettingsTab) =>
    `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors text-left ${
      activeTab === tab
        ? "bg-[#292929] text-white shadow-sm font-semibold"
        : "text-[#aeaea9] hover:bg-[#252528] hover:text-white"
    }`;

  return (
    <div className="flex h-full min-h-[calc(100vh-56px)] bg-[#131314] text-white select-none">
      {/* Settings Sub-Sidebar */}
      <div className="w-64 shrink-0 border-r border-[#262629] bg-[#1e1e1f] p-3 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Back button and User & Plan info matching Image 3 */}
          <div className="flex items-center gap-2 px-1 mb-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg text-[#8e8ea0] hover:text-white hover:bg-[#252528] transition-colors shrink-0"
              title="Back to Home"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <GmailProfileAvatar 
                name={user?.name ?? "Saransh"}
                email={user?.email ?? "choudharysaransh69@gmail.com"}
                avatarUrl={user?.avatar_url}
                className="w-5 h-5 rounded-[4px] shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-white">
                  {user?.email || "choudharysaransh69@gmail.com"}
                </p>
                <p className="text-[10px] text-[#8e8ea0]">Free Plan</p>
              </div>
              <ChevronDown size={13} className="text-[#8e8ea0] shrink-0" />
            </div>
          </div>

          {/* Personal vs Team Switcher */}
          <div className="flex rounded-lg bg-[#16161a] p-1 border border-[#27272a] mb-3">
            <button
              type="button"
              onClick={() => setScope("personal")}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                scope === "personal" ? "bg-[#292929] text-white shadow-sm" : "text-[#8e8ea0] hover:text-white"
              }`}
            >
              Personal
            </button>
            <button
              type="button"
              onClick={() => setScope("team")}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                scope === "team" ? "bg-[#292929] text-white shadow-sm" : "text-[#8e8ea0] hover:text-white"
              }`}
            >
              Team
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("appearance")}
              className={navItemClass("appearance")}
            >
              <Settings size={16} />
              <span>Language & Appearance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("recording")}
              className={navItemClass("recording")}
            >
              <Video size={16} />
              <span>Recording & Privacy</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("compliance")}
              className={navItemClass("compliance")}
            >
              <Bell size={16} />
              <span>Compliance Notification</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("email")}
              className={navItemClass("email")}
            >
              <GmailLogo className="w-4 h-4 shrink-0" />
              <span>Email Assistant</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ai")}
              className={navItemClass("ai")}
            >
              <Sparkles size={16} />
              <span>AI Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("live")}
              className={navItemClass("live")}
            >
              <Radio size={16} />
              <span>Live Assist</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("knowledge")}
              className={navItemClass("knowledge")}
            >
              <Book size={16} />
              <span>Knowledge Base</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("api")}
              className={navItemClass("api")}
            >
              <Code size={16} />
              <span>MCP & API</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cookies")}
              className={navItemClass("cookies")}
            >
              <Shield size={16} />
              <span>Cookies</span>
            </button>
          </nav>
        </div>

        {/* Bottom Nav items */}
        <div className="space-y-0.5 border-t border-[#262629] pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("refer")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold bg-[#2a1c4a]/50 text-[#c4b5fd] border border-[#6f42ec]/30 hover:bg-[#2a1c4a] transition-colors"
          >
            <Gift size={16} className="text-[#a78bfa]" />
            <span>Refer and earn $5 each</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={navItemClass("account")}
          >
            <User size={16} />
            <span>Account</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`${navItemClass("security")} justify-between`}
          >
            <div className="flex items-center gap-3">
              <Lock size={16} />
              <span>Security overview</span>
            </div>
            <span className="rounded bg-[#6f42ec]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#c4b5fd]">
              2/3
            </span>
          </button>
        </div>
      </div>

      {/* Main Settings Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-4xl bg-[#131314]">
        {/* Top Search & Feedback */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings"
              className="w-full rounded-lg border border-[#27272a] bg-[#1a1a1d] pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#71717a] outline-none focus:border-[#6f42ec]"
            />
          </div>

          <button
            type="button"
            onClick={() => toast.info("Feedback dialog opened")}
            className="flex items-center gap-1.5 text-xs text-[#8e8ea0] hover:text-white transition-colors"
          >
            <MessageSquare size={14} />
            <span>Feedback</span>
          </button>
        </div>

        {/* Email Assistant Banner */}
        {!bannerDismissed && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#27272a] bg-[#18181c] p-3.5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <GmailLogo className="w-4 h-4 shrink-0" />
              <p className="text-xs text-white">
                <span className="font-semibold">Email Assistant</span> — Auto-drafts replies and follow-ups, and labels your inbox.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => toast.info("Connecting Email Assistant...")}
                className="flex items-center gap-1 rounded-lg bg-[#27272e] px-3 py-1 text-xs font-semibold text-white hover:bg-[#32323b] transition-colors"
              >
                <span>Try Now</span>
                <ArrowRight size={12} />
              </button>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                className="text-[#71717a] hover:text-white transition-colors p-1"
                aria-label="Dismiss banner"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: Recording & Privacy */}
        {activeTab === "recording" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-[13px] font-medium text-[#9ca3af]">Recording</h2>
            </div>

            <div className="rounded-2xl border border-[#26262b] bg-[#16161a] p-5 space-y-5">
              {/* Option 1: Auto-record meetings */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-0.5 rounded bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#38bdf8] shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                        <circle cx="8" cy="11" r="1.5" />
                        <circle cx="16" cy="11" r="1.5" />
                        <path d="M9 16c1.5 1 4.5 1 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[13px] font-semibold text-white">Auto-record meetings</h3>
                      <p className="text-[12px] text-[#8e8ea0] mt-0.5">
                        Fireflies notetaker will join and record your calendar events.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoRecord(!autoRecord);
                      toast.success(autoRecord ? "Auto-record disabled" : "Auto-record enabled");
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      autoRecord ? "bg-[#6938ef]" : "bg-[#27272a]"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        autoRecord ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Dropdown */}
                <div className="relative pl-8">
                  <select
                    value={recordScope}
                    onChange={(e) => setRecordScope(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-[#27272b] bg-[#1a1a1e] px-3 py-2 text-[12px] text-white outline-none focus:border-[#6938ef] pr-8 cursor-pointer"
                  >
                    <option>Record only meetings I host</option>
                    <option>Record all calendar meetings with a video link</option>
                    <option>Record internal meetings only</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8ea0]" />
                </div>
              </div>

              <div className="border-t border-[#232328]" />

              {/* Option 2: Capture meeting video */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-0.5 text-[#8e8ea0] shrink-0">
                    <Video size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-[13px] font-semibold text-white">Capture meeting video</h3>
                      <Crown size={12} className="text-[#a78bfa]" />
                    </div>
                    <p className="text-[12px] text-[#8e8ea0] mt-0.5">
                      Capture your meeting screen and shared content as video.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCaptureVideo(!captureVideo);
                    toast.info(captureVideo ? "Video recording turned off" : "Video recording enabled (Pro trial)");
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    captureVideo ? "bg-[#6938ef]" : "bg-[#27272a]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      captureVideo ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-[#232328]" />

              {/* Option 3: Meeting language */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-0.5 text-[#8e8ea0] flex items-center justify-center font-serif text-sm font-semibold shrink-0">
                    T
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-white">Meeting language</h3>
                    <p className="text-[12px] text-[#8e8ea0] mt-0.5">For transcripts and summaries.</p>
                  </div>
                </div>
                <div className="relative pl-8">
                  <select
                    value={meetingLang}
                    onChange={(e) => setMeetingLang(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-[#27272b] bg-[#1a1a1e] px-3 py-2 text-[12px] text-white outline-none focus:border-[#6938ef] pr-8 cursor-pointer"
                  >
                    <option>English (Global)</option>
                    <option>Spanish (Español)</option>
                    <option>French (Français)</option>
                    <option>German (Deutsch)</option>
                    <option>Hindi (हिंदी)</option>
                    <option>Japanese (日本語)</option>
                  </select>
                  <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8e8ea0]" />
                </div>
              </div>

              <div className="border-t border-[#232328]" />

              {/* Option 4: Auto-delete meetings */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-0.5 text-[#8e8ea0] shrink-0">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-[13px] font-semibold text-white">Auto-delete meetings</h3>
                      <Crown size={12} className="text-[#a78bfa]" />
                    </div>
                    <p className="text-[12px] text-[#8e8ea0] mt-0.5">
                      Automatically delete meetings after a set retention period.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAutoDelete(!autoDelete);
                    toast.info(autoDelete ? "Auto-delete disabled" : "Auto-delete configured (30 days)");
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    autoDelete ? "bg-[#6938ef]" : "bg-[#27272a]"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      autoDelete ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Language & Appearance */}
        {activeTab === "appearance" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Language & Appearance</h2>
              <p className="text-xs text-[#8e8ea0] mt-1">Customize your display mode and interface language.</p>
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#16161a] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Theme</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    applyTheme("light");
                    toast.info("Light mode applied");
                  }}
                  className="flex items-center gap-3 rounded-xl border border-[#27272a] bg-[#1c1c20] p-4 text-left hover:border-[#6f42ec] transition-colors"
                >
                  <Sun size={20} className="text-amber-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">Light</p>
                    <p className="text-xs text-[#8e8ea0]">Clean, daylight palette</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    applyTheme("dark");
                    toast.info("Dark mode applied");
                  }}
                  className="flex items-center gap-3 rounded-xl border border-[#6f42ec] bg-[#1c1c20] p-4 text-left"
                >
                  <Moon size={20} className="text-[#a78bfa]" />
                  <div>
                    <p className="text-sm font-semibold text-white">Dark (Active)</p>
                    <p className="text-xs text-[#8e8ea0]">Fireflies signature dark palette</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Account & Profile */}
        {activeTab === "account" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Account Details</h2>
              <p className="text-xs text-[#8e8ea0] mt-1">Manage your Fireflies profile and connected accounts.</p>
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#16161a] p-5 space-y-4">
              <div className="flex items-center gap-4">
                <GmailProfileAvatar
                  name={user?.name ?? "Saransh"}
                  email={user?.email ?? "choudharysaransh69@gmail.com"}
                  avatarUrl={user?.avatar_url}
                  className="w-14 h-14 rounded-xl shrink-0"
                />
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-semibold text-[#8e8ea0] uppercase tracking-wider mb-1 block">Full Name</label>
                    <input
                      disabled
                      value={user?.name ?? "Saransh"}
                      aria-label="Name"
                      className={`${inputClass} opacity-90`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#8e8ea0] uppercase tracking-wider mb-1 block">Gmail / Google Account</label>
                    <input
                      disabled
                      value={user?.email ?? "choudharysaransh69@gmail.com"}
                      aria-label="Email"
                      className={`${inputClass} opacity-90`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#26262a]">
                <div className="flex items-center gap-2">
                  <GmailLogo className="w-4 h-4 shrink-0" />
                  <span className="text-xs text-[#d1d5db]">Connected via Google Workspace / Gmail</span>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success("Gmail profile photo synchronized successfully")}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#27272e] hover:bg-[#32323b] text-white border border-[#3b3b45] transition-colors"
                >
                  Sync Google Avatar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generic Handler for other tabs */}
        {activeTab !== "recording" && activeTab !== "appearance" && activeTab !== "account" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white capitalize">{activeTab.replace("-", " ")}</h2>
              <p className="text-xs text-[#8e8ea0] mt-1">Configure your preference parameters.</p>
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#16161a] p-8 text-center">
              <p className="text-sm text-white font-medium">Settings configured and synced with cloud.</p>
              <p className="text-xs text-[#8e8ea0] mt-1">All changes are automatically saved.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

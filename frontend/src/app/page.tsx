"use client";

import { useState } from "react";
import { 
  Calendar, 
  ChevronRight, 
  Plus, 
  Upload, 
  Settings, 
  X,
  Monitor,
  Smartphone,
  Download
} from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { useOpenNewMeeting } from "@/components/layout/AppShell";
import { ErrorState, Spinner } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { api } from "@/lib/api";
import { FirefliesMeetingLogo, AppStoreLogo, GooglePlayLogo } from "@/components/ui/BrandIcons";
import { Modal } from "@/components/ui/Modal";

export default function HomePage() {
  const toast = useToast();
  const openNewMeeting = useOpenNewMeeting();
  const { data: user } = useSWR("me", api.getMe);
  const { data: meetings, error } = useSWR(["meetings", "all"], () => api.listMeetings());
  const [activeTab, setActiveTab] = useState<"recent" | "upcoming" | "aifeed">("recent");
  const [heroDismissed, setHeroDismissed] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2026-10-09");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [meetingPlatform, setMeetingPlatform] = useState("Google Meet");

  if (error) return <ErrorState message={error.message} />;
  if (!meetings || !user) return <Spinner />;

  const displayName = user?.name?.split(" ")[0] || "Saransh";

  return (
    <div 
      className="min-h-full px-4 py-6 md:px-10 space-y-7 relative pb-20 select-none"
      style={{
        background: "radial-gradient(ellipse 80% 50% at 50% 0%, #1a222f 0%, #131314 55%)"
      }}
    >
      <div className="mx-auto max-w-4xl space-y-7">
        
        {/* 1. Hero Welcome Banner (Exact 1:1 match to Fireflies.ai) */}
        {!heroDismissed && (
          <div 
            className="relative overflow-hidden rounded-2xl border p-6 md:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6"
            style={{
              background: "linear-gradient(135deg, #2b180d 0%, #3a2012 50%, #2f190e 100%)",
              borderColor: "#552e18"
            }}
          >
            <button
              type="button"
              onClick={() => setHeroDismissed(true)}
              aria-label="Dismiss banner"
              className="absolute top-3 right-3 text-[#a88265] hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="max-w-md">
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight font-display">
                Welcome Aboard, {displayName}!
              </h1>
              <p className="mt-2 text-[13px] text-[#cbb5a5] leading-relaxed">
                Fireflies is now ready to automate your meetings and streamline your workflows.
              </p>
            </div>

            {/* Video preview demo card linking to official Fireflies Product Demo */}
            <a 
              href="https://www.youtube.com/watch?v=uZuFXgNfZmI"
              target="_blank"
              rel="noopener noreferrer"
              title="Watch Fireflies Product Demo on YouTube"
              className="shrink-0 cursor-pointer group hover:scale-[1.03] active:scale-[0.98] transition-transform block"
            >
              <img 
                src="/video_demo_card.png" 
                alt="Fireflies Product Demo"
                className="w-[145px] md:w-[160px] h-auto rounded-xl border border-[#e5975f]/70 shadow-[0_0_24px_rgba(229,151,95,0.25)] object-contain group-hover:border-[#e5975f] group-hover:shadow-[0_0_30px_rgba(229,151,95,0.4)] transition-all"
              />
            </a>
          </div>
        )}

        {/* 2. Quick Start Section (Responsive 3 buttons) */}
        <div>
          <h2 className="text-[14px] font-semibold text-white mb-1">Quick Start</h2>
          <p className="text-[12px] text-[#8e8ea0] mb-4">
            Capture your first meeting or upload a recording to see Fireflies in action.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {/* Button 1: Schedule Meeting */}
            <div
              onClick={() => setScheduleModalOpen(true)}
              className="rounded-xl p-4 flex items-center justify-between cursor-pointer hover:brightness-110 active:scale-[0.99] transition-all border shadow-sm group"
              style={{ backgroundColor: "#3a1423", borderColor: "#552136" }}
            >
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-[#e14975] group-hover:scale-105 transition-transform" />
                <span className="text-[13px] font-medium text-white">Schedule Meeting</span>
              </div>
              <ChevronRight size={14} className="text-white/40 group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* Button 2: Upload File */}
            <div
              onClick={openNewMeeting}
              className="rounded-xl p-4 flex items-center justify-between cursor-pointer hover:brightness-110 active:scale-[0.99] transition-all border shadow-sm group"
              style={{ backgroundColor: "#0c2622", borderColor: "#17483f" }}
            >
              <div className="flex items-center gap-3">
                <Upload size={18} className="text-[#22c55e] group-hover:scale-105 transition-transform" />
                <span className="text-[13px] font-medium text-white">Upload File</span>
              </div>
              <ChevronRight size={14} className="text-white/40 group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* Button 3: Capture Meeting */}
            <div
              onClick={openNewMeeting}
              className="rounded-xl p-4 flex items-center justify-between cursor-pointer hover:brightness-110 active:scale-[0.99] transition-all border shadow-sm group"
              style={{ backgroundColor: "#17152e", borderColor: "#2c2756" }}
            >
              <div className="flex items-center gap-3">
                <Plus size={18} className="text-[#6f42ec] group-hover:scale-105 transition-transform" />
                <span className="text-[13px] font-medium text-white">Capture Meeting</span>
              </div>
              <ChevronRight size={14} className="text-white/40 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* 3. Segmented Tabs & Settings */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center bg-[#1a1a1d] rounded-lg p-1 border border-[#27272a]">
            <button
              type="button"
              onClick={() => setActiveTab("recent")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === "recent"
                  ? "bg-[#2f2f36] text-white shadow-sm font-semibold"
                  : "text-[#8e8ea0] hover:text-white"
              }`}
            >
              Recent
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upcoming")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === "upcoming"
                  ? "bg-[#2f2f36] text-white shadow-sm font-semibold"
                  : "text-[#8e8ea0] hover:text-white"
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("aifeed")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === "aifeed"
                  ? "bg-[#2f2f36] text-white shadow-sm font-semibold"
                  : "text-[#8e8ea0] hover:text-white"
              }`}
            >
              AI Feed
            </button>
          </div>

          <Link
            href="/settings"
            className="flex items-center gap-1.5 text-xs text-[#8e8ea0] hover:text-white font-medium transition-colors"
          >
            <Settings size={14} />
            <span>Settings</span>
          </Link>
        </div>

        {/* 4. Meetings List (Recent shows meeting, Upcoming & AI Feed display nothing) */}
        {activeTab === "recent" && (
          <div className="space-y-2">
            {meetings.slice(0, 1).map((meeting) => {
              return (
                <Link
                  key={meeting.id}
                  href={`/meetings/${meeting.id}`}
                  className="group flex items-center justify-between p-3 rounded-xl bg-[#16161a] hover:bg-[#1e1e22] border border-[#232328] hover:border-[#33333a] transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <FirefliesMeetingLogo className="w-8 h-8 rounded-lg shrink-0 shadow-sm" />
                    <div className="min-w-0">
                      <h3 className="text-[13px] font-semibold text-white group-hover:text-[#a78bfa] truncate transition-colors">
                        Fireflies AI Platform Quick Overview
                      </h3>
                      <p className="text-[11px] text-[#8e8ea0] mt-0.5">
                        Thu, Aug 8 2024, 3:52 PM
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 5. Try More Section (Exact 1:1 match to screenshot) */}
        <div className="pt-2 space-y-3.5">
          <h2 className="text-[14px] font-semibold text-white">Try More</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Desktop App */}
            <div className="rounded-2xl border border-[#26262b] bg-[#18181c] p-5 space-y-3.5 shadow-sm">
              <Monitor size={22} className="text-[#3b82f6]" strokeWidth={1.8} />
              <div>
                <h3 className="text-[13px] font-semibold text-white">Desktop App</h3>
                <p className="text-[12px] text-[#8e8ea0] mt-1 leading-relaxed">
                  Capture conversations without any bot present in your meeting.
                </p>
              </div>
              <button
                type="button"
                onClick={() => toast.info("Downloading Fireflies Desktop App...")}
                className="flex items-center gap-1.5 rounded-lg bg-[#6938ef] hover:bg-[#5b32cc] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors shadow-sm"
              >
                <Download size={13} strokeWidth={2} />
                <span>Download</span>
              </button>
            </div>

            {/* Card 2: Mobile App */}
            <div className="rounded-2xl border border-[#26262b] bg-[#18181c] p-5 space-y-3.5 shadow-sm">
              <Smartphone size={22} className="text-[#ec4899]" strokeWidth={1.8} />
              <div>
                <h3 className="text-[13px] font-semibold text-white">Mobile App</h3>
                <p className="text-[12px] text-[#8e8ea0] mt-1 leading-relaxed">
                  Record in-person conversations and review meetings on the go.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => toast.info("Opening Apple App Store...")}
                  className="w-8 h-8 rounded-lg bg-[#141418] border border-[#272730] flex items-center justify-center hover:bg-[#202028] transition-colors"
                  title="App Store"
                >
                  <AppStoreLogo className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("Opening Google Play Store...")}
                  className="w-8 h-8 rounded-lg bg-[#141418] border border-[#272730] flex items-center justify-center hover:bg-[#202028] transition-colors"
                  title="Google Play"
                >
                  <GooglePlayLogo className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Schedule Meeting Modal */}
      <Modal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Meeting with Fireflies Notetaker"
        description="Fred will automatically join your scheduled call to record, transcribe and extract action items."
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setScheduleModalOpen(false)}
              className="px-3 py-1.5 rounded-md border border-[#2a2a30] text-xs text-[#aeaea9] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setScheduleModalOpen(false);
                toast.success(`Meeting scheduled for ${selectedDate} at ${selectedTime}!`);
              }}
              className="px-3.5 py-1.5 rounded-md bg-[#6938ef] hover:bg-[#5b32cc] text-xs font-semibold text-white transition-colors"
            >
              Save & Sync
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-[#8e8ea0] mb-1">Platform</label>
            <select
              value={meetingPlatform}
              onChange={(e) => setMeetingPlatform(e.target.value)}
              className="w-full rounded-md border border-[#27272a] bg-[#1a1a1d] px-3 py-2 text-white outline-none focus:border-[#6938ef]"
            >
              <option>Google Meet</option>
              <option>Zoom</option>
              <option>Microsoft Teams</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8e8ea0] mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-md border border-[#27272a] bg-[#1a1a1d] px-3 py-2 text-white outline-none focus:border-[#6938ef]"
              />
            </div>
            <div>
              <label className="block text-[#8e8ea0] mb-1">Time</label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full rounded-md border border-[#27272a] bg-[#1a1a1d] px-3 py-2 text-white outline-none focus:border-[#6938ef]"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Floating Help Circle at Bottom Right */}
      <button
        type="button"
        onClick={() => toast.info("Fireflies Help & Documentation center")}
        aria-label="Help"
        className="fixed bottom-5 right-5 z-40 flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f5f9] text-[#0f172a] font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all"
      >
        <span>?</span>
      </button>
    </div>
  );
}

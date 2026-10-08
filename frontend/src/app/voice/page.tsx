"use client";

import { useState } from "react";
import { 
  Headphones, 
  Play, 
  Mic, 
  PhoneOff, 
  ChevronUp, 
  Plus, 
  X, 
  Sparkles,
  Radio
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import useSWR from "swr";
import { api } from "@/lib/api";
import { FirefliesMeetingLogo } from "@/components/ui/BrandIcons";

export default function VoiceAgentsPage() {
  const toast = useToast();
  const { data: user } = useSWR("me", api.getMe);
  const [activeTab, setActiveTab] = useState<"discover" | "my">("discover");
  const [cloningDismissed, setCloningDismissed] = useState(false);
  const [inCall, setInCall] = useState(false);

  const displayName = user?.name?.split(" ")[0] || "Saransh";

  return (
    <div className="min-h-full px-6 py-4 md:px-10 space-y-6 select-none bg-[#131314] text-white relative pb-20">
      
      {/* 1. Tabs: Discover | My Voice Agents */}
      <div className="flex items-center gap-6 border-b border-[#232328] pb-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("discover")}
          className={`pb-2.5 transition-colors ${
            activeTab === "discover"
              ? "text-white border-b-2 border-[#6938ef]"
              : "text-[#8e8ea0] hover:text-white"
          }`}
        >
          Discover
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("my")}
          className={`pb-2.5 transition-colors ${
            activeTab === "my"
              ? "text-white border-b-2 border-[#6938ef]"
              : "text-[#8e8ea0] hover:text-white"
          }`}
        >
          My Voice Agents
        </button>
      </div>

      {/* 2. Hero Carousel Banner (Exact 1:1 match to Image 1) */}
      <div className="relative overflow-hidden rounded-2xl border border-[#2b2b38] bg-gradient-to-r from-[#1b1c2b] via-[#1c1e2e] to-[#121320] p-6 md:p-8 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Hero Info */}
          <div className="max-w-md space-y-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[22px] md:text-[24px] font-bold text-white tracking-tight font-display">
                Experience Voice Agents
              </h1>
              <span className="flex items-center gap-1 rounded-full bg-[#2a2244] border border-[#483375] px-2.5 py-0.5 text-[11px] font-medium text-[#c4b5fd]">
                <Sparkles size={11} className="text-[#a78bfa]" />
                <span>50 free AI credits</span>
              </span>
            </div>

            <p className="text-[13px] md:text-[14px] text-[#9ca3af] leading-relaxed">
              Voice Agents handle your calls, ask the right questions, and deliver clear insights.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setInCall(true);
                  toast.info("Connecting to Acme's Voice Agent...");
                }}
                className="flex items-center gap-2 rounded-lg bg-[#6938ef] hover:bg-[#5b32cc] px-4 py-2 text-[13px] font-semibold text-white transition-colors shadow-sm"
              >
                <Headphones size={15} />
                <span>Try It Live</span>
              </button>

              <a
                href="https://www.youtube.com/watch?v=uZuFXgNfZmI"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-[#222226] hover:bg-[#2c2c32] border border-[#333338] px-4 py-2 text-[13px] font-semibold text-white transition-colors"
              >
                <Play size={13} className="fill-white" />
                <span>Watch Demo</span>
              </a>
            </div>
          </div>

          {/* Right Interactive Mockup Agent Card (1:1 from Image 1) */}
          <div className="relative w-full max-w-[320px] rounded-2xl border border-[#262634] bg-[#0c0d18] p-5 shadow-2xl flex flex-col items-center">
            {/* Speech bubble */}
            <div className="mb-6 rounded-full bg-[#1e2338]/90 border border-[#2d3454] px-4 py-1.5 text-[11px] text-[#e0e7ff] shadow-md">
              How do you handle tight deadlines?
            </div>

            {/* Glowing neon circular orb avatar */}
            <div className="relative flex items-center justify-center mb-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#6938ef] via-[#a855f7] to-[#06b6d4] p-[3px] shadow-[0_0_35px_rgba(168,85,247,0.45)]">
                <div className="w-full h-full rounded-full bg-[#0c0d18] flex items-center justify-center">
                  <Headphones size={28} className="text-[#c4b5fd]" />
                </div>
              </div>
            </div>

            <p className="text-[11px] font-medium text-[#8e8ea0] mb-4">
              Acme&apos;s Voice Agent
            </p>

            {/* Floating pill audio call controls */}
            <div className="flex items-center gap-2 rounded-full bg-[#181926] border border-[#262738] p-1.5 px-3 shadow-md">
              <button type="button" onClick={() => toast.info("Mute microphone")} className="p-1 text-[#8e8ea0] hover:text-white transition-colors">
                <Mic size={14} />
              </button>
              <button type="button" className="p-1 text-[#8e8ea0] hover:text-white transition-colors">
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setInCall(false);
                  toast.info("Call disconnected");
                }}
                className="w-6 h-6 rounded-full bg-[#ef4444] hover:bg-[#dc2626] flex items-center justify-center text-white transition-colors shadow-sm ml-1"
              >
                <PhoneOff size={11} />
              </button>
            </div>
          </div>

        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex justify-center items-center gap-1.5 mt-6">
          <span className="w-2.5 h-1 bg-[#6938ef] rounded-full" />
          <span className="w-1.5 h-1.5 bg-[#4b5563] rounded-full" />
        </div>
      </div>

      {/* 3. Voice Cloning Announcement Bar (Exact 1:1 match to Image 1) */}
      {!cloningDismissed && (
        <div className="rounded-xl bg-[#091a24] border border-[#163c4e] px-4 py-2.5 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <Radio size={14} className="text-[#38bdf8] shrink-0" />
            <span className="text-[#e0f2fe]">
              <span className="font-semibold">Try Voice Cloning</span> — Make your agent sound exactly like you in 30 seconds.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toast.info("Opening Voice Cloning studio...")}
              className="font-semibold text-[#38bdf8] hover:underline"
            >
              Create Voice Agent
            </button>
            <button
              type="button"
              onClick={() => setCloningDismissed(true)}
              aria-label="Dismiss banner"
              className="text-[#94a3b8] hover:text-white transition-colors p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 4. Section: Saransh, set up your Voice Agent in 2 minutes */}
      <div className="pt-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-white font-display">
              {displayName}, set up your Voice Agent in 2 minutes
            </h2>
            <button
              type="button"
              onClick={() => toast.info("Feedback dialog opened")}
              className="flex items-center gap-1.5 text-[12px] text-[#8e8ea0] hover:text-white transition-colors mt-0.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Share Feedback</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => toast.info("Opening Custom Agent Builder...")}
            className="flex items-center gap-1.5 rounded-lg bg-[#6938ef] hover:bg-[#5b32cc] px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors shadow-sm"
          >
            <Plus size={14} />
            <span>Custom Agent</span>
          </button>
        </div>

        {/* 2 Agent Cards Grid (Exact 1:1 match to Image 1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Screening Interview Agent */}
          <div
            onClick={() => toast.info("Launching Screening Interview Agent...")}
            className="rounded-2xl border border-[#232328] bg-[#16161a] hover:bg-[#1a1a20] hover:border-[#33333d] p-6 h-[150px] flex flex-col justify-between cursor-pointer transition-all shadow-sm group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#c026d3] flex items-center justify-center shadow-md">
              <FirefliesMeetingLogo className="w-6 h-6 rounded-md" />
            </div>
            <h3 className="text-[13px] font-medium text-white group-hover:text-[#c4b5fd] transition-colors">
              Screening Interview Agent
            </h3>
          </div>

          {/* Card 2: Discovery Call Agent */}
          <div
            onClick={() => toast.info("Launching Discovery Call Agent...")}
            className="rounded-2xl border border-[#232328] bg-[#16161a] hover:bg-[#1a1a20] hover:border-[#33333d] p-6 h-[150px] flex flex-col justify-between cursor-pointer transition-all shadow-sm group"
          >
            <div className="w-11 h-11 rounded-xl bg-[#0d9488] flex items-center justify-center shadow-md">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                <rect x="5" y="4" width="14" height="4" rx="2" fill="currentColor" />
                <rect x="5" y="10" width="10" height="4" rx="2" fill="currentColor" />
                <rect x="5" y="16" width="4" height="4" rx="2" fill="currentColor" />
              </svg>
            </div>
            <h3 className="text-[13px] font-medium text-white group-hover:text-[#c4b5fd] transition-colors">
              Discovery Call Agent
            </h3>
          </div>
        </div>
      </div>

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

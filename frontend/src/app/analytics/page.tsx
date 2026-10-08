"use client";

import Link from "next/link";
import { Star, BarChart3, TrendingUp, Users, Target, Activity } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function AnalyticsPage() {
  const toast = useToast();

  return (
    <div className="relative h-full w-full bg-[#131314] text-white select-none overflow-hidden flex items-center justify-center p-4">
      
      {/* 1. Realistic Blurred Background Dashboard (Deal Intelligence & Team Metrics) */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 p-8 grid grid-cols-1 md:grid-cols-3 gap-6 filter blur-[9px] opacity-40 select-none"
      >
        {/* KPI Card 1 */}
        <div className="rounded-2xl border border-[#26262b] bg-[#18181c] p-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8e8ea0]">
            <span>Talk vs Listen Ratio</span>
            <Users size={16} />
          </div>
          <div className="text-2xl font-bold text-white">42% / 58%</div>
          <div className="h-3 w-full rounded-full bg-[#27272a] overflow-hidden flex">
            <div className="w-[42%] bg-[#6938ef]" />
            <div className="w-[58%] bg-[#10b981]" />
          </div>
        </div>

        {/* KPI Card 2 */}
        <div className="rounded-2xl border border-[#26262b] bg-[#18181c] p-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8e8ea0]">
            <span>Deal Sentiment Index</span>
            <TrendingUp size={16} />
          </div>
          <div className="text-2xl font-bold text-[#10b981]">+84.2 NPS</div>
          <div className="h-2 w-full rounded-full bg-[#27272a]">
            <div className="h-full w-[84%] rounded-full bg-[#10b981]" />
          </div>
        </div>

        {/* KPI Card 3 */}
        <div className="rounded-2xl border border-[#26262b] bg-[#18181c] p-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8e8ea0]">
            <span>Competitor Mentions</span>
            <Target size={16} />
          </div>
          <div className="text-2xl font-bold text-white">18 flagged</div>
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-[#27272e] text-[#a78bfa]">ZoomInfo (11)</span>
            <span className="px-2 py-0.5 rounded bg-[#27272e] text-[#a78bfa]">Gong (7)</span>
          </div>
        </div>

        {/* Large Chart Container */}
        <div className="md:col-span-3 rounded-2xl border border-[#26262b] bg-[#18181c] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Pipeline Velocity & Conversation Volume</span>
            <BarChart3 size={18} className="text-[#8e8ea0]" />
          </div>
          <div className="h-44 w-full flex items-end gap-3 pt-6">
            {[45, 60, 35, 80, 95, 70, 85, 90, 65, 80, 100, 75].map((h, i) => (
              <div key={i} className="flex-1 bg-[#232328] rounded-t-md relative group">
                <div 
                  style={{ height: `${h}%` }} 
                  className="w-full bg-gradient-to-t from-[#6938ef] to-[#a78bfa] rounded-t-md" 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Exact Centered Upgrade Modal Card (1:1 Match to Image 4) */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-[#2b2b32] bg-[#1a1a1d] p-8 md:p-10 text-center shadow-2xl space-y-5">
        
        {/* Gold circular badge with black star */}
        <div className="mx-auto w-12 h-12 rounded-full bg-[#f59e0b] flex items-center justify-center shadow-[0_0_28px_rgba(245,158,11,0.45)]">
          <Star size={22} className="fill-black text-black" />
        </div>

        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
          Unlock Deal Intelligence &amp; Team Analytics
        </h1>

        {/* Subtitle */}
        <p className="text-xs md:text-sm text-[#8e8ea0] max-w-sm mx-auto leading-relaxed">
          Upgrade to business plan or above to access it.
        </p>

        {/* CTA Button */}
        <div className="pt-2">
          <Link
            href="/upgrade"
            className="inline-block rounded-lg bg-[#6938ef] hover:bg-[#5b32cc] px-6 py-2.5 text-xs font-semibold text-white transition-all shadow-md hover:shadow-lg shadow-[#6938ef]/30"
          >
            Upgrade now
          </Link>
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

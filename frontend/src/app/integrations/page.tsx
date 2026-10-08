"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  ChevronDown, 
  ArrowUp, 
  Layers, 
  Zap,
  Sparkles
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface IntegrationItem {
  id: string;
  name: string;
  author: string;
  description: string;
  category: string;
  iconBg: string;
  icon: string;
}

const INTEGRATION_ITEMS: IntegrationItem[] = [
  {
    id: "activecampaign",
    name: "ActiveCampaign",
    author: "Fireflies",
    description: "Sync Fireflies meeting notes to ActiveCampaign CRM and keep your contacts and companies automatically updated with deal insights.",
    category: "CRM",
    iconBg: "#004cff",
    icon: ">",
  },
  {
    id: "activepieces",
    name: "Activepieces",
    author: "Activepieces",
    description: "Activepieces offers a no-code integration with Fireflies.ai, enabling users to automate workflows involving meeting transcripts and actions.",
    category: "CRM",
    iconBg: "#6938ef",
    icon: "▲",
  },
  {
    id: "affinity",
    name: "Affinity",
    author: "Fireflies",
    description: "Automatically sync meeting data and tasks to the relevant people and companies in Affinity, streamlining your relationship intelligence.",
    category: "CRM",
    iconBg: "#0284c7",
    icon: "●",
  },
];

export default function IntegrationsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"discover" | "connected">("discover");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [mcpEnabled, setMcpEnabled] = useState(true);

  return (
    <div className="min-h-full px-6 py-4 md:px-10 space-y-6 select-none bg-[#131314] text-white relative pb-20">
      
      {/* 1. Tabs: Discover | Connected */}
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
          onClick={() => setActiveTab("connected")}
          className={`pb-2.5 transition-colors ${
            activeTab === "connected"
              ? "text-white border-b-2 border-[#6938ef]"
              : "text-[#8e8ea0] hover:text-white"
          }`}
        >
          Connected
        </button>
      </div>

      {/* 2. Hero Carousel Banner: Fireflies MCP for Claude (Exact 1:1 match to Image 2) */}
      <div className="relative overflow-hidden rounded-2xl border border-[#262632] bg-[#16161c] p-6 md:p-8 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left: Claude MCP Pitch */}
          <div className="max-w-md space-y-3.5">
            <div className="flex items-center gap-3">
              {/* Anthropic Sunburst Logo on White badge */}
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                  <path d="M12 3v18M3 12h18M5.63 5.63l12.74 12.74M5.63 18.37l12.74-12.74" stroke="#d97706" strokeWidth="2.8" strokeLinecap="round" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[20px] md:text-[22px] font-bold text-white tracking-tight font-display">
                    Fireflies MCP for Claude
                  </h1>
                  <span className="rounded bg-[#0c2e1b] px-1.5 py-0.5 text-[10px] font-bold text-[#22c55e] border border-[#164e2d]">
                    NEW
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[13px] text-[#9ca3af] leading-relaxed">
              Ask Claude anything about your meetings — surface insights, track action items, and search past calls with Fireflies MCP.
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => toast.info("Connecting Fireflies MCP to Claude...")}
                className="flex items-center gap-1.5 rounded-lg bg-[#6938ef] hover:bg-[#5b32cc] px-4 py-2 text-[13px] font-semibold text-white transition-colors shadow-sm"
              >
                <Plus size={15} />
                <span>Connect</span>
              </button>
              <p className="text-[11px] text-[#71717a] mt-2 italic">
                *Also available for ChatGPT.
              </p>
            </div>
          </div>

          {/* Right: Mockup Claude MCP Interface Card */}
          <div className="w-full max-w-[340px] rounded-2xl border border-[#2b2b36] bg-[#1a1a22] p-4 shadow-xl space-y-3">
            <p className="text-[13px] font-medium text-[#e2e8f0]">
              What did I discuss in my last meeting with Sam?
            </p>

            <div className="rounded-xl border border-[#323240] bg-[#121217] p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#71717a] text-sm">+</span>
                {/* Fireflies tool pill with toggle */}
                <div className="flex items-center gap-1.5 rounded-full bg-[#251846] border border-[#43267d] px-2 py-0.5 text-[10px] text-[#c4b5fd] font-semibold">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-[#d946ef] flex items-center justify-center text-[7px] text-white font-bold">F</span>
                  <span>Fireflies</span>
                  <button
                    type="button"
                    onClick={() => setMcpEnabled(!mcpEnabled)}
                    className={`w-6 h-3 rounded-full p-0.5 ml-1 transition-colors ${
                      mcpEnabled ? "bg-[#38bdf8]" : "bg-[#475569]"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full bg-white transition-transform ${
                      mcpEnabled ? "translate-x-3" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              </div>

              <div className="w-6 h-6 rounded-md bg-[#ea580c] flex items-center justify-center text-white">
                <ArrowUp size={13} />
              </div>
            </div>
          </div>

        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex justify-center items-center gap-1.5 mt-6">
          <span className="w-2.5 h-1 bg-[#6938ef] rounded-full" />
          <span className="w-1.5 h-1.5 bg-[#4b5563] rounded-full" />
          <span className="w-1.5 h-1.5 bg-[#4b5563] rounded-full" />
        </div>
      </div>

      {/* 3. Category Filter Pills Row (Exact 1:1 match to Image 2) */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[12px] font-medium">
            {["All", "Audio recording", "Applicant tracking system", "CRM", "MCP"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? "bg-[#251846] text-[#c4b5fd] border border-[#43267d] font-semibold"
                    : "text-[#8e8ea0] hover:text-white hover:bg-[#1f1f24] border border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}

            <button
              type="button"
              onClick={() => toast.info("More integration categories")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[#8e8ea0] hover:text-white transition-colors shrink-0"
            >
              <span>More</span>
              <ChevronDown size={12} />
            </button>
          </div>

          <div className="relative w-48 shrink-0">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717a]" />
            <input
              placeholder="Search"
              className="h-8 w-full rounded-md border border-[#27272a] bg-[#161619] pl-8 pr-2.5 text-[12px] text-white placeholder:text-[#71717a] outline-none focus:border-[#6938ef] transition-colors"
            />
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => toast.info("Feedback dialog opened")}
            className="flex items-center gap-1.5 text-[12px] text-[#8e8ea0] hover:text-white transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Share Feedback</span>
          </button>
        </div>
      </div>

      {/* 4. Integrations 3-Column Cards Grid (Exact match to Image 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ActiveCampaign */}
        <div
          onClick={() => toast.info("Connecting ActiveCampaign...")}
          className="rounded-2xl border border-[#232328] bg-[#16161a] hover:bg-[#1a1a20] hover:border-[#383842] p-5 cursor-pointer transition-all shadow-sm space-y-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#004cff] flex items-center justify-center text-white shadow-sm font-bold text-sm">
            &gt;
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-white group-hover:text-[#c4b5fd] transition-colors">
              ActiveCampaign
            </h3>
            <p className="text-[12px] text-[#8e8ea0] mt-0.5">Fireflies</p>
          </div>
          <p className="text-[12px] text-[#8e8ea0] leading-relaxed line-clamp-3">
            Sync Fireflies meeting notes to ActiveCampaign CRM and keep your contacts and companies automatically updated with deal insights.
          </p>
        </div>

        {/* Activepieces */}
        <div
          onClick={() => toast.info("Connecting Activepieces...")}
          className="rounded-2xl border border-[#232328] bg-[#16161a] hover:bg-[#1a1a20] hover:border-[#383842] p-5 cursor-pointer transition-all shadow-sm space-y-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#6938ef] flex items-center justify-center text-white shadow-sm font-bold text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L2 12h5v9h10v-9h5L12 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-white group-hover:text-[#c4b5fd] transition-colors">
              Activepieces
            </h3>
            <p className="text-[12px] text-[#8e8ea0] mt-0.5">Activepieces</p>
          </div>
          <p className="text-[12px] text-[#8e8ea0] leading-relaxed line-clamp-3">
            Activepieces offers a no-code integration with Fireflies.ai, enabling users to automate workflows involving meeting transcripts and actions.
          </p>
        </div>

        {/* Affinity */}
        <div
          onClick={() => toast.info("Connecting Affinity...")}
          className="rounded-2xl border border-[#232328] bg-[#16161a] hover:bg-[#1a1a20] hover:border-[#383842] p-5 cursor-pointer transition-all shadow-sm space-y-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#0284c7] flex items-center justify-center text-white shadow-sm p-1">
            <div className="grid grid-cols-2 gap-1 w-4 h-4">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-white group-hover:text-[#c4b5fd] transition-colors">
              Affinity
            </h3>
            <p className="text-[12px] text-[#8e8ea0] mt-0.5">Fireflies</p>
          </div>
          <p className="text-[12px] text-[#8e8ea0] leading-relaxed line-clamp-3">
            Automatically sync meeting data and tasks to the relevant people and companies in Affinity, streamlining your relationship intelligence.
          </p>
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

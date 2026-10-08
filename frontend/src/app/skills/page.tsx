"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Plus, 
  Search, 
  ChevronDown, 
  Zap, 
  Link as LinkIcon, 
  X, 
  ArrowRight,
  Code2
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { FirefliesMeetingLogo, SlackLogo } from "@/components/ui/BrandIcons";

interface Skill {
  id: string;
  name: string;
  description: string;
  author: string;
  runs: string;
  enabled: boolean;
  color: string;
  iconBg: string;
}

const ENGINEERING_SKILLS: Skill[] = [
  {
    id: "auto-finder",
    name: "Automation Finder",
    description: "Identify tasks that could benefit from automation.",
    author: "Fireflies",
    runs: "59.6k",
    enabled: true,
    color: "#a78bfa",
    iconBg: "#432b7d",
  },
  {
    id: "proc-improve",
    name: "Process Improvement",
    description: "Highlight friction points in engineering workflows and propose optimizations.",
    author: "Fireflies",
    runs: "49.9k",
    enabled: false,
    color: "#34d399",
    iconBg: "#064e3b",
  },
  {
    id: "feat-req",
    name: "Feature Requirements",
    description: "Convert customer and team requests into clear engineering requirement tickets.",
    author: "Fireflies",
    runs: "49k",
    enabled: false,
    color: "#60a5fa",
    iconBg: "#1e3a8a",
  },
  {
    id: "infra-scale",
    name: "Infrastructure Scaling",
    description: "Analyze server and latency discussions to surface scaling bottlenecks.",
    author: "Fireflies",
    runs: "15.3k",
    enabled: false,
    color: "#fbbf24",
    iconBg: "#78350f",
  },
  {
    id: "infra-costs",
    name: "Infrastructure Costs",
    description: "Audit discussions for cloud hosting, AWS/GCP bills, and cost optimizations.",
    author: "Fireflies",
    runs: "11.8k",
    enabled: false,
    color: "#22d3ee",
    iconBg: "#164e63",
  },
  {
    id: "alert-thresh",
    name: "Alert Thresholds",
    description: "Extract monitoring alerts and error budgets discussed during triage.",
    author: "Fireflies",
    runs: "10.9k",
    enabled: false,
    color: "#4ade80",
    iconBg: "#14532d",
  },
];

export default function SkillsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"discover" | "active" | "feed">("discover");
  const [skills, setSkills] = useState<Skill[]>(ENGINEERING_SKILLS);
  const [selectedSkillId, setSelectedSkillId] = useState<string>("auto-finder");
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const selectedSkill = skills.find((s) => s.id === selectedSkillId) || skills[0];

  const toggleSkill = (id: string) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  return (
    <div className="min-h-full px-6 py-4 md:px-10 space-y-4 select-none bg-[#131314] text-white relative pb-20">
      
      {/* 1. Purple Announcement Banner (Exact 1:1 match to Image 5) */}
      {!bannerDismissed && (
        <div className="rounded-xl bg-[#231b3e] border border-[#3b2b6d] px-4 py-2.5 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#ec4899] shrink-0" />
            <span className="text-[#e2e8f0]">
              Meet AI Skills — Automate meeting insights, follow-ups, and reports.
            </span>
            <a
              href="#learn-more"
              onClick={(e) => {
                e.preventDefault();
                toast.info("Opening AI Skills documentation...");
              }}
              className="text-[#a78bfa] hover:underline inline-flex items-center ml-1 font-medium"
            >
              See how it works →
            </a>
          </div>

          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss banner"
            className="text-[#94a3b8] hover:text-white transition-colors p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. Tabs Row: Discover | Active Skills (1) | Feed + "+ Create Skill" Button */}
      <div className="flex items-center justify-between border-b border-[#232328] pb-1">
        <div className="flex items-center gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("discover")}
            className={`pb-2.5 transition-colors relative ${
              activeTab === "discover"
                ? "text-white border-b-2 border-[#6938ef]"
                : "text-[#8e8ea0] hover:text-white"
            }`}
          >
            Discover
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`pb-2.5 transition-colors relative ${
              activeTab === "active"
                ? "text-white border-b-2 border-[#6938ef]"
                : "text-[#8e8ea0] hover:text-white"
            }`}
          >
            Active Skills (1)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("feed")}
            className={`pb-2.5 transition-colors relative ${
              activeTab === "feed"
                ? "text-white border-b-2 border-[#6938ef]"
                : "text-[#8e8ea0] hover:text-white"
            }`}
          >
            Feed
          </button>
        </div>

        <button
          type="button"
          onClick={() => toast.info("Opening custom AI Skill builder...")}
          className="flex items-center gap-1.5 rounded-lg bg-[#6938ef] hover:bg-[#5b32cc] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors shadow-sm"
        >
          <Plus size={14} />
          <span>Create Skill</span>
        </button>
      </div>

      {/* 3. Main Split View: Left list of skills, Right skill detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Left Column: Category dropdown + Skills list */}
        <div className="lg:col-span-5 space-y-3">
          {/* Category Dropdown & Search */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => toast.info("Category selector: Engineering, Sales, Product, Marketing")}
              className="flex items-center justify-between flex-1 px-3 py-2 rounded-lg bg-[#1a1a1d] border border-[#27272a] text-xs text-white hover:border-[#3f3f46] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code2 size={14} className="text-[#8e8ea0]" />
                <span className="font-medium">Engineering</span>
              </div>
              <ChevronDown size={14} className="text-[#8e8ea0]" />
            </button>

            <button
              type="button"
              onClick={() => toast.info("Search skills")}
              className="p-2 rounded-lg bg-[#1a1a1d] border border-[#27272a] text-[#8e8ea0] hover:text-white transition-colors"
            >
              <Search size={15} />
            </button>
          </div>

          {/* List of Skill cards */}
          <div className="space-y-2">
            {skills.map((skill) => {
              const isSelected = skill.id === selectedSkillId;
              return (
                <div
                  key={skill.id}
                  onClick={() => setSelectedSkillId(skill.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? "bg-[#1f1d33] border-[#6938ef] shadow-lg shadow-[#6938ef]/10"
                      : "bg-[#18181c] border-[#26262b] hover:bg-[#1e1e24] hover:border-[#383842]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      style={{ backgroundColor: skill.iconBg, color: skill.color }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                    >
                      <Sparkles size={16} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-semibold text-white truncate">{skill.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <FirefliesMeetingLogo className="w-3 h-3 rounded-[2px]" />
                        <span className="text-[11px] text-[#8e8ea0]">{skill.author}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <div className="flex items-center gap-1 text-[11px] text-[#8e8ea0]">
                      <Zap size={11} className="text-[#8e8ea0]" />
                      <span>{skill.runs}</span>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSkill(skill.id);
                      }}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                        skill.enabled ? "bg-[#6938ef]" : "bg-[#2c2c34]"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          skill.enabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Skill Detail Panel (Exact 1:1 match to Image 5) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-[#26262b] bg-[#18181c] p-6 shadow-sm">
          <div className="space-y-6">
            
            {/* Header: Big Icon + Copy Link */}
            <div className="flex items-start justify-between">
              <div
                style={{ backgroundColor: selectedSkill.iconBg, color: selectedSkill.color }}
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
              >
                <Sparkles size={24} />
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Skill link copied");
                }}
                className="flex items-center gap-1.5 text-xs text-[#8e8ea0] hover:text-white transition-colors"
              >
                <LinkIcon size={13} />
                <span>Copy Link</span>
              </button>
            </div>

            {/* Title & Description */}
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{selectedSkill.name}</h2>
              <p className="mt-1 text-xs text-[#8e8ea0] leading-relaxed">
                {selectedSkill.description}
              </p>

              <div className="flex items-center gap-4 mt-4 text-xs text-[#8e8ea0]">
                <div className="flex items-center gap-1.5">
                  <FirefliesMeetingLogo className="w-3.5 h-3.5 rounded-[2px]" />
                  <span>{selectedSkill.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap size={12} className="text-[#8e8ea0]" />
                  <span>{selectedSkill.runs}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Enable, Try Skill, Edit */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => toggleSkill(selectedSkill.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors shadow-sm ${
                    selectedSkill.enabled
                      ? "bg-[#6938ef] hover:bg-[#5b32cc]"
                      : "bg-[#27272e] hover:bg-[#32323a] border border-[#3b3b45]"
                  }`}
                >
                  {selectedSkill.enabled ? "Enable" : "Enable"}
                </button>

                <button
                  type="button"
                  onClick={() => toast.info(`Running ${selectedSkill.name} on latest meeting...`)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#3b2b6d] bg-[#1a1730] hover:bg-[#251e44] text-xs font-semibold text-[#c4b5fd] transition-colors"
                >
                  <Sparkles size={13} />
                  <span>Try Skill</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => toast.info("Edit skill parameters")}
                className="px-3.5 py-1.5 rounded-lg border border-[#2b2b32] hover:border-[#3f3f4b] text-xs text-[#8e8ea0] hover:text-white transition-colors"
              >
                Edit
              </button>
            </div>

            {/* Share Feedback link */}
            <div>
              <button
                type="button"
                onClick={() => toast.info("Feedback dialog opened")}
                className="text-xs text-[#8e8ea0] hover:text-white transition-colors"
              >
                Share Feedback
              </button>
            </div>
          </div>

          {/* Bottom Slack Integration Banner (Exact match to Image 5) */}
          <div className="mt-8 rounded-xl border border-[#2a2a32] bg-[#1c1c20] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SlackLogo className="w-5 h-5 shrink-0" />
              <p className="text-xs text-white">
                <span className="font-semibold">Get insights on Slack</span> — Receive skills output to your Slack channel.
              </p>
            </div>

            <button
              type="button"
              onClick={() => toast.info("Connecting Slack channel...")}
              className="flex items-center gap-1 text-xs font-semibold text-[#818cf8] hover:text-[#a5b4fc] transition-colors shrink-0 ml-4"
            >
              <span>Connect</span>
              <ArrowRight size={13} />
            </button>
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

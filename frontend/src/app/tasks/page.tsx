"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { AsanaLogo, MondayLogo, TrelloLogo, ClickUpLogo } from "@/components/ui/BrandIcons";

export default function TasksPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"my" | "all">("my");
  const [tasks, setTasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  return (
    <div className="h-full flex flex-col justify-between px-6 py-6 md:px-12 select-none bg-[#131314] text-white relative">
      <div className="mx-auto max-w-4xl w-full space-y-6">
        
        {/* Top Header: My Tasks vs All Tasks Segmented Control & Share Feedback (Exact match to Image 1) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-[#1c1c1f] rounded-lg p-1 border border-[#27272a]">
            <button
              type="button"
              onClick={() => setActiveTab("my")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "my"
                  ? "bg-[#38383f] text-white shadow-sm"
                  : "text-[#8e8ea0] hover:text-white"
              }`}
            >
              My Tasks
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === "all"
                  ? "bg-[#38383f] text-white shadow-sm"
                  : "text-[#8e8ea0] hover:text-white"
              }`}
            >
              All Tasks
            </button>
          </div>

          <button
            type="button"
            onClick={() => toast.info("Feedback dialog opened")}
            className="text-xs text-[#8e8ea0] hover:text-white transition-colors"
          >
            Share Feedback
          </button>
        </div>

        {/* Integration Callout Banner with 4 App Logos (Asana, Monday, Trello, ClickUp) */}
        <div className="rounded-xl border border-[#2b2b30] bg-[#1a1a1c] px-5 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <AsanaLogo className="w-4 h-4 shrink-0" />
              <MondayLogo className="w-4 h-4 shrink-0" />
              <TrelloLogo className="w-4 h-4 shrink-0" />
              <ClickUpLogo className="w-4 h-4 shrink-0" />
            </div>
            <p className="text-xs text-[#d1d5db] font-normal">
              Automatically send all your tasks to your work apps.
            </p>
          </div>

          <button
            type="button"
            onClick={() => toast.info("Opening integrations...")}
            className="text-xs font-semibold text-[#60a5fa] hover:underline"
          >
            Connect
          </button>
        </div>

        {/* Center Empty State (Exact 1:1 match to Image 1) */}
        <div className="py-24 flex flex-col items-center justify-center text-center">
          {/* Two small stacked horizontal outline pill icons */}
          <div className="flex flex-col items-center gap-1.5 mb-5 opacity-60">
            <div className="w-6 h-2.5 rounded-[3px] border border-[#71717a]" />
            <div className="w-6 h-2.5 rounded-[3px] border border-[#71717a]" />
          </div>

          <h2 className="text-base font-semibold text-white mb-2 tracking-tight">
            All your meeting tasks in one place
          </h2>
          <p className="text-xs text-[#8e8ea0] leading-relaxed mb-6">
            Manage, assign and update all your meeting tasks here.
          </p>

          <button
            type="button"
            onClick={() => toast.info("Create new task")}
            className="flex items-center gap-1.5 rounded-lg bg-[#6938ef] hover:bg-[#5b32cc] px-4 py-2 text-xs font-semibold text-white transition-colors shadow-sm"
          >
            <Plus size={15} />
            <span>New</span>
          </button>
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

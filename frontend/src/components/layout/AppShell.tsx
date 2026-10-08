"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { ArrowRight, X } from "lucide-react";
import { NewMeetingModal } from "../meetings/NewMeetingModal";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

// Lets any page open the single "New meeting / Upload" modal: const openNewMeeting = useOpenNewMeeting();
const NewMeetingContext = createContext<() => void>(() => {});
export const useOpenNewMeeting = () => useContext(NewMeetingContext);

/** Fireflies exact shell layout */
export function AppShell({ children }: { children: ReactNode }) {
  const [newMeetingOpen, setNewMeetingOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const openNewMeeting = useCallback(() => setNewMeetingOpen(true), []);

  return (
    <NewMeetingContext.Provider value={openNewMeeting}>
      <div className="flex flex-col h-screen overflow-hidden bg-[#131314] text-white">
        {/* Global Announcement Banner */}
        {!bannerDismissed && (
          <div className="relative bg-[#17152e] text-[12px] py-1.5 px-4 flex justify-center items-center shrink-0 border-b border-[#231e3d] z-50">
            <div className="flex items-center text-center">
              <span className="text-white/90">You are eligible for 7 days business plan free trial.</span>
              <a href="/upgrade" className="text-[#9d7aff] hover:underline inline-flex items-center ml-1.5 font-medium">
                Start free trial <ArrowRight size={12} className="ml-1 opacity-90" />
              </a>
            </div>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              aria-label="Dismiss banner"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white transition-colors p-1"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex flex-1 min-h-0">
          <Sidebar onUpload={openNewMeeting} />
          <div className="flex min-w-0 flex-1 flex-col relative bg-[#131314]">
            <Topbar onUpload={openNewMeeting} />
            <main className="min-h-0 flex-1 overflow-y-auto bg-[#131314]">{children}</main>
          </div>
        </div>
      </div>
      <NewMeetingModal open={newMeetingOpen} onClose={() => setNewMeetingOpen(false)} />
    </NewMeetingContext.Provider>
  );
}

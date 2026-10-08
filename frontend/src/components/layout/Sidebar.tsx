"use client";

import { useState } from "react";
import { 
  Home, 
  Video, 
  ListTodo, 
  Sparkles, 
  BarChart3, 
  Bot, 
  Zap, 
  Layers, 
  Settings, 
  PanelLeft,
  ChevronDown,
  X,
  User as UserIcon,
  LogOut,
  Check
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useToast } from "../ui/Toast";
import useSWR from "swr";
import { api } from "@/lib/api";
import { WindowsLogo, GmailLogo, ChromeLogo, AppStoreLogo, GooglePlayLogo, FirefliesMeetingLogo } from "@/components/ui/BrandIcons";
import { GmailProfileAvatar } from "./GmailProfileAvatar";

const AskFredIcon = ({ className = "text-[#a78bfa]" }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={`shrink-0 ${className}`}>
    <path d="M12 2V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M7 3.5L8.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M17 3.5L15.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <rect x="4" y="6" width="16" height="12" rx="4" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="9" cy="11.5" r="1.5" fill="currentColor" />
    <circle cx="15" cy="11.5" r="1.5" fill="currentColor" />
    <path d="M9 15C10 16 14 16 15 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const itemBase = "flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-[13px] font-normal transition-colors";

export function Sidebar({ onUpload }: { onUpload: () => void }) {
  const pathname = usePathname();
  const toast = useToast();
  const { data: user } = useSWR("me", api.getMe);
  const [promoSlide, setPromoSlide] = useState<0 | 1>(1); // Slide 2 matches screenshots ("Invite coworkers")
  const [promoDismissed, setPromoDismissed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [collapsedOverride, setCollapsedOverride] = useState<boolean | null>(null);

  // AskFred and Meetings pages default to the sleek compact icon strip in Fireflies
  const isDefaultCompact = pathname.startsWith("/askfred") || pathname.startsWith("/meetings");
  const isCompact = collapsedOverride !== null ? collapsedOverride : isDefaultCompact;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const getLinkClass = (href: string) => {
    const active = isActive(href);
    return `${itemBase} ${
      active
        ? "bg-[#292929] text-white font-medium shadow-sm"
        : "text-[#aeaea9] hover:bg-[#252528] hover:text-white"
    }`;
  };

  const getCompactLinkClass = (href: string) => {
    const active = isActive(href);
    return `w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
      active
        ? "bg-[#292929] text-white shadow-sm"
        : "text-[#8e8ea0] hover:bg-[#252528] hover:text-white"
    }`;
  };

  const displayName = user?.name?.split(" ")[0] || "Saransh";
  const userEmail = user?.email || "saransh@gmail.com";

  // COMPACT ICON-ONLY SIDEBAR (matches AskFred and Meetings screenshots)
  if (isCompact) {
    return (
      <aside className="hidden w-[58px] shrink-0 flex-col items-center justify-between border-r border-[#262629] bg-[#1a1a1c] py-3.5 md:flex select-none z-20">
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Avatar button */}
          <button
            type="button"
            onClick={() => setCollapsedOverride(!isCompact)}
            title="Expand sidebar"
            className="p-1 rounded-lg hover:bg-[#252528] transition-colors"
          >
            <GmailProfileAvatar 
              name={displayName} 
              email={userEmail} 
              avatarUrl={user?.avatar_url}
              className="w-7 h-7 rounded-[7px] shrink-0"
            />
          </button>

          {/* Nav Icons */}
          <nav className="flex flex-col items-center gap-1.5 w-full px-2">
            <Link href="/" title="Home" className={getCompactLinkClass("/")}>
              <Home size={18} strokeWidth={1.8} />
            </Link>

            <Link href="/askfred" title="AskFred" className={getCompactLinkClass("/askfred")}>
              <AskFredIcon className={isActive("/askfred") ? "text-white" : "text-[#a78bfa]"} />
            </Link>

            <Link href="/meetings" title="Meetings" className={getCompactLinkClass("/meetings")}>
              <Video size={18} strokeWidth={1.8} />
            </Link>

            <Link href="/tasks" title="Tasks" className={getCompactLinkClass("/tasks")}>
              <ListTodo size={18} strokeWidth={1.8} />
            </Link>

            <Link href="/skills" title="AI Skills" className={getCompactLinkClass("/skills")}>
              <Sparkles size={18} strokeWidth={1.8} />
            </Link>

            <Link href="/analytics" title="Analytics" className={getCompactLinkClass("/analytics")}>
              <BarChart3 size={18} strokeWidth={1.8} />
            </Link>

            <Link href="/voice" title="Voice Agents" className={getCompactLinkClass("/voice")}>
              <Bot size={18} strokeWidth={1.8} />
            </Link>

            <Link href="/upgrade" title="Upgrade" className={`relative ${getCompactLinkClass("/upgrade")}`}>
              <Zap size={18} strokeWidth={1.8} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#22c55e] rounded-full" />
            </Link>
          </nav>
        </div>

        {/* Bottom utility icons */}
        <div className="flex flex-col items-center gap-2 w-full px-2">
          <Link href="/settings" title="Account" className="w-9 h-9 flex items-center justify-center rounded-lg text-[#8e8ea0] hover:bg-[#252528] hover:text-white transition-colors">
            <UserIcon size={16} />
          </Link>
          <Link href="/integrations" title="Integrations" className="w-9 h-9 flex items-center justify-center rounded-lg text-[#8e8ea0] hover:bg-[#252528] hover:text-white transition-colors">
            <Layers size={16} />
          </Link>
          <Link href="/settings" title="Settings" className="w-9 h-9 flex items-center justify-center rounded-lg text-[#8e8ea0] hover:bg-[#252528] hover:text-white transition-colors">
            <Settings size={16} />
          </Link>
        </div>
      </aside>
    );
  }

  // FULL EXPANDED SIDEBAR (matches Home, Tasks, AI Skills screenshots)
  return (
    <aside className="hidden w-[240px] shrink-0 flex-col border-r border-[#262629] bg-[#1e1e1f] md:flex select-none relative z-20">
      {/* Top Workspace / User Header */}
      <div className="px-3 pt-3 pb-2 relative">
        <div 
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#252528] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <GmailProfileAvatar 
              name={displayName} 
              email={userEmail} 
              avatarUrl={user?.avatar_url}
              className="w-6 h-6 rounded-[6px] shrink-0"
            />
            <span className="truncate text-[14px] font-semibold text-white tracking-tight">
              {displayName}
            </span>
            <ChevronDown size={14} className={`text-[#8e8ea0] shrink-0 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCollapsedOverride(true);
            }}
            aria-label="Collapse sidebar"
            className="text-[#8e8ea0] hover:text-white transition-colors p-1"
          >
            <PanelLeft size={16} />
          </button>
        </div>

        {/* User / Gmail Account Dropdown */}
        {/* User / Gmail Account 2-Column Flyout Dropdown (Exact 1:1 match to Image 4) */}
        {userMenuOpen && (
          <div className="absolute top-[52px] left-3 z-50 flex rounded-2xl border border-[#2b2b32] bg-[#1a1a1d] shadow-2xl backdrop-blur-md overflow-hidden min-w-[460px]">
            {/* Column 1: Account info & Navigation */}
            <div className="w-[220px] p-4 border-r border-[#26262a] flex flex-col justify-between">
              <div>
                <p className="text-[13px] font-semibold text-white">Hi {displayName}</p>
                <p className="text-[11px] text-[#8e8ea0] truncate">{userEmail}</p>

                {/* Free Plan with green bar */}
                <div className="mt-3">
                  <p className="text-[11px] font-semibold text-white">Free</p>
                  <div className="w-full h-1 bg-[#22c55e] rounded-full my-1.5" />
                  <p className="text-[11px] text-[#8e8ea0]">3 left / 3 free meetings</p>
                  <Link
                    href="/upgrade"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 mt-2 rounded-md border border-[#164e2d] bg-[#0c2e1b]/40 text-[#22c55e] text-[11px] font-semibold hover:bg-[#0c2e1b]/70 transition-colors"
                  >
                    <Zap size={12} />
                    <span>Upgrade</span>
                  </Link>
                </div>

                {/* Storage */}
                <div className="mt-3">
                  <p className="text-[11px] font-semibold text-white">Storage</p>
                  <p className="text-[11px] text-[#8e8ea0] mt-0.5">0 / 400 mins</p>
                </div>

                <div className="h-px bg-[#26262a] my-2.5" />

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    toast.info("Referral link copied!");
                  }}
                  className="w-full text-left text-[12px] text-[#d1d5db] hover:text-white transition-colors"
                >
                  Refer and Earn $5
                </button>

                <div className="h-px bg-[#26262a] my-2.5" />

                {/* Sub links */}
                <div className="space-y-1.5 text-[12px] text-[#aeaea9]">
                  <Link href="/meetings" onClick={() => setUserMenuOpen(false)} className="block hover:text-white transition-colors">
                    Playlist
                  </Link>
                  <Link href="/settings" onClick={() => setUserMenuOpen(false)} className="block hover:text-white transition-colors">
                    Settings
                  </Link>
                  <Link href="/team" onClick={() => setUserMenuOpen(false)} className="block hover:text-white transition-colors">
                    My Team
                  </Link>
                  <button type="button" onClick={() => toast.info("Manage Web Logins")} className="w-full text-left hover:text-white transition-colors">
                    Manage Web Logins
                  </button>
                  <button type="button" onClick={() => toast.info("Platform Rules")} className="w-full text-left hover:text-white transition-colors">
                    Platform Rules
                  </button>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="flex items-center gap-1">
                      <span>Theme</span>
                      <span className="text-[9px] font-bold text-[#a78bfa] bg-[#3b2b6d]/60 px-1 py-0.2 rounded border border-[#4c3590]">BETA</span>
                    </span>
                    <span className="text-[11px] text-[#71717a]">Dark</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      toast.info("Logged out from Fireflies");
                    }}
                    className="w-full text-left hover:text-white transition-colors pt-1 text-[#8e8ea0]"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Column 2: Promo Flyout Cards */}
            <div className="w-[240px] p-4 bg-[#161619] flex flex-col justify-between space-y-3">
              {/* Card 1: Mobile App */}
              <div className="rounded-xl border border-[#26262b] bg-[#1a1a1e] p-3 space-y-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 text-[#ef4444]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                      <path d="M12 18h.01" />
                    </svg>
                  </div>
                  <p className="text-[12px] font-semibold text-white">Mobile App</p>
                </div>
                <p className="text-[11px] text-[#8e8ea0] leading-snug">
                  Transcribe and summarize in-person conversations with mobile app.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => toast.info("Opening Apple App Store...")}
                    className="w-8 h-8 rounded-lg bg-[#202026] border border-[#2b2b32] flex items-center justify-center hover:bg-[#272730] transition-colors"
                  >
                    <AppStoreLogo className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info("Opening Google Play Store...")}
                    className="w-8 h-8 rounded-lg bg-[#202026] border border-[#2b2b32] flex items-center justify-center hover:bg-[#272730] transition-colors"
                  >
                    <GooglePlayLogo className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card 2: Chrome Extension */}
              <div className="rounded-xl border border-[#26262b] bg-[#1a1a1e] p-3 space-y-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <ChromeLogo className="w-4 h-4 shrink-0" />
                  <p className="text-[12px] font-semibold text-white">Chrome Extension</p>
                </div>
                <p className="text-[11px] text-[#8e8ea0] leading-snug">
                  Record and transcribe Google Meet calls without Fireflies notetaker bot.
                </p>
                <button
                  type="button"
                  onClick={() => toast.info("Installing Chrome Extension...")}
                  className="px-3 py-1 rounded-md bg-[#242429] text-[11px] font-medium text-white hover:bg-[#303038] border border-[#32323a] transition-colors"
                >
                  Install
                </button>
              </div>

              {/* Card 3: Download Fireflies Desktop App */}
              <button
                type="button"
                onClick={() => toast.info("Downloading Fireflies Desktop App...")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#3b2b6d] bg-[#1f1738] hover:bg-[#281e48] transition-colors shadow-sm text-left group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FirefliesMeetingLogo className="w-5 h-5 rounded-[4px] shrink-0" />
                  <span className="text-[11px] font-semibold text-white truncate">
                    Download Fireflies Desktop App
                  </span>
                </div>
                <span className="text-[#a78bfa] group-hover:translate-x-0.5 transition-transform text-xs">→</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main 1:1 Fireflies Navigation List */}
      <nav className="flex flex-1 flex-col px-3 py-1 overflow-y-auto space-y-1">
        <Link href="/" className={getLinkClass("/")}>
          <Home size={18} strokeWidth={1.8} className="shrink-0" />
          <span>Home</span>
        </Link>

        <Link href="/askfred" className={getLinkClass("/askfred")}>
          <AskFredIcon />
          <span>AskFred</span>
        </Link>

        <Link href="/meetings" className={getLinkClass("/meetings")}>
          <Video size={18} strokeWidth={1.8} className="shrink-0" />
          <span>Meetings</span>
        </Link>

        <Link href="/tasks" className={getLinkClass("/tasks")}>
          <ListTodo size={18} strokeWidth={1.8} className="shrink-0" />
          <span>Tasks</span>
        </Link>

        <Link href="/skills" className={getLinkClass("/skills")}>
          <Sparkles size={18} strokeWidth={1.8} className="shrink-0" />
          <span>AI Skills</span>
        </Link>

        <div className="pt-2" />

        <Link href="/analytics" className={getLinkClass("/analytics")}>
          <BarChart3 size={18} strokeWidth={1.8} className="shrink-0" />
          <span>Analytics</span>
        </Link>

        <Link href="/voice" className={getLinkClass("/voice")}>
          <Bot size={18} strokeWidth={1.8} className="shrink-0" />
          <span>Voice Agents</span>
        </Link>

        <div className="pt-2" />

        <Link href="/upgrade" className={`${getLinkClass("/upgrade")} justify-between pr-2`}>
          <div className="flex items-center gap-3">
            <Zap size={18} strokeWidth={1.8} className="shrink-0" />
            <span>Upgrade</span>
          </div>
          <span className="text-[10px] font-bold tracking-wide text-[#22c55e] px-1.5 py-0.5 rounded bg-[#0c2e1b] border border-[#164e2d]">
            40% OFF
          </span>
        </Link>

        <div className="pt-1.5" />

        {/* Try Email Assistant CTA */}
        <Link 
          href="/settings" 
          className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium bg-[#1a1636] border border-[#2b2554] text-white hover:border-[#6f42ec]/60 transition-colors shadow-sm"
        >
          <GmailLogo className="w-4 h-4 shrink-0" />
          <span>Try Email Assistant</span>
        </Link>

        <div className="pt-1.5" />

        <Link href="/integrations" className={getLinkClass("/integrations")}>
          <Layers size={18} strokeWidth={1.8} className="shrink-0" />
          <span>Integrations</span>
        </Link>

        <Link href="/settings" className={getLinkClass("/settings")}>
          <Settings size={18} strokeWidth={1.8} className="shrink-0" />
          <span>Settings</span>
        </Link>
      </nav>

      {/* Bottom Promo Card */}
      {!promoDismissed && (
        <div className="p-3 pt-2">
          <div className="rounded-xl bg-[#16161a] p-3.5 border border-[#26262b] shadow-lg relative">
            <button
              type="button"
              onClick={() => setPromoDismissed(true)}
              aria-label="Dismiss banner"
              className="absolute top-2.5 right-2.5 text-[#71717a] hover:text-white transition-colors"
            >
              <X size={14} />
            </button>

            {promoSlide === 0 ? (
              <>
                <div className="mb-2">
                  <WindowsLogo className="w-4 h-4 shrink-0" />
                </div>
                <p className="text-[13px] font-semibold text-white leading-tight">
                  Bot-less meetings with<br />Desktop App
                </p>
                <button
                  type="button"
                  onClick={() => toast.info("Downloading Fireflies Desktop App...")}
                  className="mt-3 w-full rounded-md bg-[#6938ef] hover:bg-[#5b32cc] py-1.5 text-[12px] font-semibold text-white transition-colors shadow-sm"
                >
                  Download
                </button>
              </>
            ) : (
              <>
                <p className="text-[13px] font-semibold text-white leading-tight mt-1">
                  Invite coworkers to your<br />Fireflies team
                </p>
                <Link
                  href="/team"
                  className="mt-3 block text-center w-full rounded-md bg-[#6938ef] hover:bg-[#5b32cc] py-1.5 text-[12px] font-semibold text-white transition-colors shadow-sm"
                >
                  Create Team
                </Link>
              </>
            )}

            {/* Pagination Dots */}
            <div className="flex justify-center items-center gap-1.5 mt-3">
              <button
                type="button"
                onClick={() => setPromoSlide(0)}
                aria-label="Slide 1"
                className={`h-1.5 rounded-full transition-all ${
                  promoSlide === 0 ? "w-3 bg-white" : "w-1.5 bg-[#52525b]"
                }`}
              />
              <button
                type="button"
                onClick={() => setPromoSlide(1)}
                aria-label="Slide 2"
                className={`h-1.5 rounded-full transition-all ${
                  promoSlide === 1 ? "w-3 bg-white" : "w-1.5 bg-[#52525b]"
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

"use client";

import { useState } from "react";

interface GmailProfileAvatarProps {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  className?: string;
  size?: number;
}

// Google Material Avatar background colors for Gmail accounts
const GOOGLE_AVATAR_COLORS = [
  "#0F9D58", // Google Emerald
  "#4285F4", // Google Blue
  "#EA4335", // Google Red
  "#FBBC04", // Google Yellow/Amber
  "#673AB7", // Deep Purple
  "#00897B", // Teal
  "#E65100", // Warm Amber
  "#3949AB", // Indigo
];

function getGoogleAvatarColor(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GOOGLE_AVATAR_COLORS.length;
  return GOOGLE_AVATAR_COLORS[index];
}

/**
 * Renders the user's authentic Gmail/Google Account profile photo.
 * If the user has a custom Google profile picture URL, it renders it with crisp high-DPI scaling.
 * If none or on error, it renders Google's signature Material Account Avatar with the user's initial.
 */
export function GmailProfileAvatar({
  name = "User",
  email = "",
  avatarUrl,
  className = "w-6 h-6 rounded-[6px] shrink-0",
}: GmailProfileAvatarProps) {
  const [imgError, setImgError] = useState(false);

  // If a profile photo is provided via Google OAuth / avatarUrl, display it
  const effectiveSrc = avatarUrl || (name.toLowerCase().includes("saransh") ? "/iaf_avatar.png" : null);

  const initial = (name.trim()[0] || email.trim()[0] || "U").toUpperCase();
  const bgColor = getGoogleAvatarColor(email || name);

  if (effectiveSrc && !imgError) {
    return (
      <div className={`relative overflow-hidden border border-[#333339] select-none ${className}`}>
        <img
          src={effectiveSrc}
          alt={`${name}'s Gmail profile`}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Google Material Account Avatar fallback
  return (
    <div
      style={{ backgroundColor: bgColor }}
      className={`relative flex items-center justify-center font-bold text-white shadow-sm border border-[#ffffff20] select-none ${className}`}
      title={`${name} (${email}) - Google Account`}
      aria-label={`${name}'s Google profile`}
    >
      <span className="text-[12px] leading-none font-medium tracking-wide">
        {initial}
      </span>
    </div>
  );
}

"use client";

import { Moon, Sun } from "lucide-react";
import { useLayoutEffect } from "react";
import { applyTheme, currentTheme } from "@/lib/theme";
import { IconButton } from "../ui/Button";

export function ThemeToggle() {
  // React's dev-mode remount clears the attribute the <head> script set; re-apply it.
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") applyTheme(saved);
    } catch {
      // ignore unavailable storage
    }
  }, []);

  return (
    <IconButton
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      onClick={() => applyTheme(currentTheme() === "dark" ? "light" : "dark")}
    >
      {/* Which icon shows is decided by CSS, so server and client markup always match. */}
      <Moon size={18} className="dark:hidden" />
      <Sun size={18} className="hidden dark:block" />
    </IconButton>
  );
}

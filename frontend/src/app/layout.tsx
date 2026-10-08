import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/ui/Toast";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter", 
  display: "swap" 
});

const dmSans = DM_Sans({ 
  subsets: ["latin"], 
  variable: "--font-dmsans", 
  display: "swap" 
});

export const metadata: Metadata = {
  title: "Fireflies.ai | #1 AI Teammate",
  description: "Record, transcribe, search and collaborate across your meetings. Fireflies takes notes for your meetings and turn words into actions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${dmSans.variable} h-full antialiased dark`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="h-full font-sans bg-[#131314] text-white">
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}

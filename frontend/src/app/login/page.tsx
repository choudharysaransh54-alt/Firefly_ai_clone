"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { FirefliesMeetingLogo, GooglePlayLogo } from "@/components/ui/BrandIcons";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();

  // Pre-filled with demo credentials so the user doesn't have to type anything
  const [email, setEmail] = useState("choudharysaransh69@gmail.com");
  const [password, setPassword] = useState("fireflies123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e?: FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      toast.success(`Welcome back, ${res.user.name || "Saransh"}!`);
      // Short delay for smooth transition
      setTimeout(() => {
        window.location.href = "/";
      }, 300);
    } catch (err: any) {
      toast.error(err?.message || "Failed to log in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-12 select-none relative"
      style={{
        background: "radial-gradient(ellipse 70% 50% at 50% 20%, #221c3b 0%, #131314 65%)"
      }}
    >
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6938ef]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[420px] z-10 space-y-6">
        
        {/* Fireflies Header Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xl shadow-[#6938ef]/20 p-2">
            <FirefliesMeetingLogo className="w-8 h-8 rounded-lg" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight font-display">
              Log in to Fireflies.ai
            </h1>
            <p className="text-xs text-[#8e8ea0] mt-1">
              Automate your meetings and streamline your workflows
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-[#27272e] bg-[#18181c]/90 backdrop-blur-md p-6 shadow-2xl space-y-5">
          
          {/* One-click pre-filled demo banner */}
          <div className="rounded-xl bg-[#201738] border border-[#3f2b6e] p-3 flex items-start gap-2.5 text-xs text-[#c4b5fd]">
            <CheckCircle2 size={16} className="text-[#a78bfa] shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-semibold text-white">Pre-filled credentials</span>: No typing required! Just hit the <strong className="text-white">Log in</strong> button below.
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[12px] font-medium text-[#aeaea9]">
                Work Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full rounded-xl border border-[#2a2a30] bg-[#131315] pl-9 pr-3 py-2 text-[13px] text-white placeholder-[#71717a] outline-none focus:border-[#6938ef] focus:ring-1 focus:ring-[#6938ef] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[12px] font-medium text-[#aeaea9]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => toast.info("Password reset link sent (demo)")}
                  className="text-[11px] text-[#a78bfa] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a] pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-[#2a2a30] bg-[#131315] pl-9 pr-10 py-2 text-[13px] text-white placeholder-[#71717a] outline-none focus:border-[#6938ef] focus:ring-1 focus:ring-[#6938ef] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Main Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 rounded-xl bg-[#6938ef] hover:bg-[#5b32cc] active:scale-[0.99] text-[13px] font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#6938ef]/30 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Log in</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="w-full border-t border-[#26262a]" />
            <span className="bg-[#18181c] px-3 text-[11px] text-[#71717a] uppercase tracking-wider relative">
              or
            </span>
          </div>

          {/* Google One-Click Login */}
          <button
            type="button"
            onClick={() => handleLogin()}
            disabled={loading}
            className="w-full h-9 rounded-xl border border-[#2b2b34] bg-[#141418] hover:bg-[#1f1f24] text-[12px] font-medium text-white flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-[#71717a]">
          <span>Don&apos;t have an account? </span>
          <button 
            type="button" 
            onClick={() => handleLogin()} 
            className="text-[#a78bfa] hover:underline font-medium"
          >
            Sign up
          </button>
        </div>

      </div>
    </div>
  );
}

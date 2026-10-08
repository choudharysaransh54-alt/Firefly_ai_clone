"use client";

import { useState } from "react";
import { Zap, Check, Sparkles, Shield, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function UpgradePage() {
  const toast = useToast();
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "For individuals exploring AI meeting summaries",
      current: true,
      features: [
        "Limited transcription credits (3 free)",
        "800 minutes of storage",
        "Key meeting summary bullets",
        "Google Meet, Zoom & Teams support",
      ],
    },
    {
      name: "Pro",
      price: annual ? "$10" : "$18",
      popular: true,
      description: "For professionals who want full AI intelligence",
      features: [
        "Unlimited transcription credits",
        "Unlimited storage & audio upload",
        "AskFred AI copilot access",
        "Custom AI Skills & prompts",
        "AI filters, channels & soundbites",
        "Export transcripts to Docs & PDF",
      ],
    },
    {
      name: "Business",
      price: annual ? "$19" : "$29",
      description: "For fast-moving teams and collaborative workflows",
      features: [
        "Everything in Pro, plus:",
        "Team channels & workspace sharing",
        "Conversation intelligence analytics",
        "CRM integrations (HubSpot, Salesforce)",
        "Zapier & Webhooks API access",
        "Priority live customer support",
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 space-y-8">
      {/* Promo Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#21153b] via-[#2d1b54] to-[#1d1433] p-6 border border-[#6f42ec]/30 shadow-lg text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#0c2e1b] px-3 py-1 text-xs font-bold text-[#22c55e] border border-[#164e2d] mb-3">
          <Zap size={12} fill="currentColor" /> LIMITED TIME OFFER
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Upgrade to Fireflies Pro with 40% OFF
        </h1>
        <p className="mt-2 text-sm text-[#c4b5fd] max-w-xl mx-auto">
          Unlock unlimited meeting transcriptions, conversational AI searches with AskFred, and automated workflow integrations.
        </p>

        {/* Billing Toggle */}
        <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#16161a] p-1 border border-[#27272a]">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              !annual ? "bg-[#27272e] text-white shadow-sm" : "text-[#71717a] hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              annual ? "bg-[#6f42ec] text-white shadow-sm" : "text-[#71717a] hover:text-white"
            }`}
          >
            Annual <span className="text-[10px] bg-[#22c55e] text-black font-extrabold px-1.5 rounded">SAVE 40%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
              plan.popular
                ? "border-[#6f42ec] bg-[#1a172e] shadow-xl ring-1 ring-[#6f42ec]"
                : "border-[#27272a] bg-[#18181c]"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#6f42ec] px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow">
                Most Popular
              </span>
            )}

            <div>
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="mt-1 text-xs text-[#71717a]">{plan.description}</p>

              <div className="my-5 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                <span className="text-xs text-[#71717a]">/ user / month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-[#d4d4d8] border-t border-[#27272a] pt-4">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <Check size={14} className="text-[#22c55e] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              disabled={plan.current}
              onClick={() => toast.success(`Upgrading to ${plan.name} plan...`)}
              className={`mt-6 w-full rounded-xl py-2.5 text-xs font-semibold transition-colors shadow-sm ${
                plan.current
                  ? "bg-[#27272a] text-[#71717a] cursor-default"
                  : plan.popular
                  ? "bg-[#6f42ec] hover:bg-[#5b32cc] text-white font-bold"
                  : "bg-[#27272e] hover:bg-[#34343d] text-white"
              }`}
            >
              {plan.current ? "Current Plan" : "Upgrade Now"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

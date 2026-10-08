"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Layers, 
  PanelLeft, 
  Mic, 
  ArrowUp, 
  Check, 
  FileText, 
  Calendar, 
  ChevronDown,
  Sparkles,
  Bot
} from "lucide-react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

interface ChatMessage {
  id: string;
  sender: "user" | "fred";
  text: string;
  timestamp: string;
}

export default function AskFredPage() {
  const toast = useToast();
  const { data: user } = useSWR("me", api.getMe);
  const { data: meetings } = useSWR(["meetings", "all"], () => api.listMeetings());
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("Sonnet 5");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [subSidebarOpen, setSubSidebarOpen] = useState(true);

  const displayName = user?.name?.split(" ")[0] || "Saransh";

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");

    // Simulate AskFred AI response
    setTimeout(() => {
      let reply = "";
      const lower = text.toLowerCase();
      if (lower.includes("action") || lower.includes("todo")) {
        reply = `Here are the top action items detected across your recent meetings for ${displayName}:\n\n1. Finalize Q4 product roadmap with the core engineering squad\n2. Distribute updated enterprise pricing sheet to customer prospects\n3. Schedule user onboarding walkthrough session\n4. Connect Gmail & Google Calendar integration for bot-less attendance`;
      } else if (lower.includes("summar")) {
        const title = meetings?.[0]?.title || "Fireflies AI Platform Quick Overview";
        reply = `Summary of "${title}":\n\n• Key consensus was reached on automated note generation and real-time transcription across Zoom and Google Meet.\n• Sub-second speaker identification latency benchmark passed.\n• SOC2 Type II compliance audit validated.`;
      } else if (lower.includes("upcoming") || lower.includes("prepare")) {
        reply = `Here is your preparation brief for your upcoming meeting:\n\n• Previous discussion items reviewed\n• Key stakeholders: Engineering, Product, Design\n• Open deliverables: 3 action items awaiting sign-off\n\nWould you like me to draft an agenda email to the participants?`;
      } else if (lower.includes("digest") || lower.includes("weekly")) {
        reply = `Weekly Meeting Digest:\n\n• Total meeting time: 3 hrs 45 mins\n• Top topics: Architecture scaling, onboarding flow v2, quarterly review\n• Sentiments: 92% positive\n• 8 action items logged`;
      } else {
        reply = `I analyzed your indexed meetings and transcripts. You have ${meetings?.length || 1} conversations indexed. Ask me about any specific decision, attendee quote, or action item!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `f-${Date.now()}`,
          sender: "fred",
          text: reply,
          timestamp: "Just now",
        },
      ]);
    }, 500);
  };

  return (
    <div className="flex h-full w-full bg-[#131314] text-white select-none relative overflow-hidden">
      {/* 1. AskFred Secondary Sidebar (Chats history list) */}
      {subSidebarOpen && (
        <aside className="w-[240px] shrink-0 border-r border-[#262629] bg-[#161618] flex flex-col justify-between py-3 px-3 relative z-10">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between px-1.5 pb-3">
              <h2 className="text-[14px] font-semibold text-white tracking-tight">AskFred</h2>
              <button
                type="button"
                onClick={() => setSubSidebarOpen(false)}
                title="Collapse AskFred panel"
                className="text-[#8e8ea0] hover:text-white transition-colors p-1"
              >
                <PanelLeft size={16} />
              </button>
            </div>

            {/* Top Action Items */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setInput("");
                  toast.info("Started new chat");
                }}
                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 text-xs text-[#d1d5db] hover:bg-[#25252a] rounded-lg transition-colors font-medium text-left"
              >
                <Plus size={15} className="text-[#a78bfa]" />
                <span>New Chat</span>
              </button>

              <button
                type="button"
                onClick={() => toast.info("Search chats")}
                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 text-xs text-[#8e8ea0] hover:text-white hover:bg-[#25252a] rounded-lg transition-colors text-left"
              >
                <Search size={14} />
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={() => toast.info("Connectors: Gmail, Notion, Slack")}
                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 text-xs text-[#8e8ea0] hover:text-white hover:bg-[#25252a] rounded-lg transition-colors text-left"
              >
                <Layers size={14} />
                <span>Connectors</span>
              </button>
            </div>

            {/* Empty State in sidebar (exact 1:1 match to Image 2) */}
            <div className="pt-16 px-2 flex flex-col items-center text-center">
              {/* Two chat bubble silhouettes */}
              <div className="flex flex-col items-center gap-1.5 mb-4 opacity-30">
                <div className="w-16 h-4 rounded-md bg-[#3f3f46]" />
                <div className="w-24 h-6 rounded-md bg-[#27272a]" />
              </div>
              <p className="text-xs font-semibold text-white mb-1">No chats yet</p>
              <p className="text-[11px] text-[#71717a] leading-relaxed">
                Your chats will appear here once you start one.
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* Button to reopen subsidebar if collapsed */}
      {!subSidebarOpen && (
        <button
          type="button"
          onClick={() => setSubSidebarOpen(true)}
          title="Open AskFred sidebar"
          className="absolute top-3 left-3 z-30 p-1.5 rounded-lg bg-[#202024] border border-[#2b2b30] text-[#8e8ea0] hover:text-white transition-colors"
        >
          <PanelLeft size={16} />
        </button>
      )}

      {/* 2. Main AskFred Workspace Area */}
      <main className="flex-1 flex flex-col items-center justify-between overflow-y-auto px-4 py-8 relative">
        <div className="w-full max-w-2xl flex flex-col items-center flex-1 justify-center space-y-7">
          
          {/* Messages list if chat is active */}
          {messages.length > 0 ? (
            <div className="w-full space-y-4 max-h-[460px] overflow-y-auto pr-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.sender === "fred" && (
                    <div className="w-7 h-7 rounded-lg bg-[#6938ef]/20 border border-[#6938ef]/30 flex items-center justify-center shrink-0 text-[#a78bfa]">
                      <Sparkles size={14} />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 whitespace-pre-wrap ${
                      m.sender === "user"
                        ? "bg-[#6938ef] text-white"
                        : "bg-[#1c1c1f] border border-[#2b2b32] text-[#e4e4e7]"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Centered Title */
            <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight text-center">
              Hi {displayName}, how can I help today?
            </h1>
          )}

          {/* Central AskFred Prompt Box (Exact 1:1 match to Image 2) */}
          <div className="w-full rounded-2xl border border-[#2b2b35] bg-[#1a1a1d] p-3 shadow-xl focus-within:border-[#6938ef]/80 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              placeholder="Ask anything, @ for context and / for skills"
              className="w-full bg-transparent text-sm text-white placeholder:text-[#71717a] outline-none resize-none px-2 pt-1"
            />

            {/* Bottom Row inside Prompt Box */}
            <div className="flex items-center justify-between pt-2 border-t border-[#232328] mt-1 px-1">
              {/* Left Actions: + and Connectors */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toast.info("Add context, files or transcripts")}
                  aria-label="Add context"
                  className="p-1.5 rounded-lg text-[#8e8ea0] hover:text-white hover:bg-[#252528] transition-colors"
                >
                  <Plus size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("Manage data connectors")}
                  aria-label="Connectors"
                  className="p-1.5 rounded-lg text-[#8e8ea0] hover:text-white hover:bg-[#252528] transition-colors"
                >
                  <Layers size={16} />
                </button>
              </div>

              {/* Right Actions: Model selector, Mic, Send Button */}
              <div className="flex items-center gap-2">
                {/* Model Selector Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                    className="flex items-center gap-1 text-xs text-[#8e8ea0] hover:text-white px-2 py-1 rounded-md hover:bg-[#252528] transition-colors"
                  >
                    <span>{selectedModel}</span>
                    <ChevronDown size={13} />
                  </button>
                  {modelDropdownOpen && (
                    <div className="absolute right-0 bottom-full mb-1 w-36 rounded-xl border border-[#2c2c34] bg-[#1a1a1d] p-1 shadow-2xl z-50 text-xs">
                      {["Sonnet 5", "Claude 3.5 Sonnet", "GPT-4o", "Fireflies LLM"].map((model) => (
                        <button
                          key={model}
                          type="button"
                          onClick={() => {
                            setSelectedModel(model);
                            setModelDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                            selectedModel === model
                              ? "bg-[#6938ef] text-white"
                              : "text-[#d1d5db] hover:bg-[#25252a] hover:text-white"
                          }`}
                        >
                          {model}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mic button */}
                <button
                  type="button"
                  onClick={() => toast.info("Voice input activated")}
                  aria-label="Voice input"
                  className="p-1.5 rounded-lg text-[#8e8ea0] hover:text-white hover:bg-[#252528] transition-colors"
                >
                  <Mic size={16} />
                </button>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSend()}
                  aria-label="Send message"
                  className="w-7 h-7 rounded-lg bg-[#6938ef] hover:bg-[#5b32cc] flex items-center justify-center text-white transition-colors shadow-sm"
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Prompt Suggestion Chips (Exact 5 items from Image 2) */}
          <div className="w-full space-y-2">
            {[
              {
                text: "List my action items & todos for this week",
                icon: <Check size={14} className="text-[#8e8ea0] shrink-0" />,
              },
              {
                text: "Summarize my last meeting",
                icon: <FileText size={14} className="text-[#8e8ea0] shrink-0" />,
              },
              {
                text: "Prepare me for the upcoming meeting",
                icon: <Bot size={14} className="text-[#8e8ea0] shrink-0" />,
              },
              {
                text: "Connect Gmail, Notion, and 30+ sources for richer insights.",
                icon: <Layers size={14} className="text-[#8e8ea0] shrink-0" />,
              },
              {
                text: "Prepare weekly digest, based on my meetings",
                icon: <Calendar size={14} className="text-[#8e8ea0] shrink-0" />,
              },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(item.text)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#232328] bg-[#161619] hover:bg-[#1f1f23] hover:border-[#33333b] transition-all text-left text-xs text-[#e4e4e7] group"
              >
                {item.icon}
                <span className="group-hover:text-white transition-colors">{item.text}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Consumes AI credits footer */}
        <p className="text-[11px] text-[#52525b] text-center mt-6">
          Consumes AI credits
        </p>
      </main>

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

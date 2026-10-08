"use client";

import { Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { formatTimestamp } from "@/lib/format";
import type { TranscriptQuote } from "@/lib/types";

interface Message {
  role: "user" | "fred";
  text: string;
  sources?: TranscriptQuote[];
  generatedBy?: string;
}

const SUGGESTIONS = ["Summarize this meeting", "What are the action items?", "What were the key decisions?", "Who talked the most?"];

/** "AskFred": a chat to ask questions about this meeting. Answers can cite transcript lines. */
export function AskFred({ meetingId, onSeek }: { meetingId: number; onSeek: (time: number) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length, asking]);

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || asking) return;
    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setQuestion("");
    setAsking(true);
    try {
      const response = await api.askQuestion(meetingId, trimmed);
      setMessages((current) => [
        ...current,
        { role: "fred", text: response.answer, sources: response.sources, generatedBy: response.generated_by },
      ]);
    } catch (error) {
      setMessages((current) => [...current, { role: "fred", text: `Sorry, something went wrong: ${(error as Error).message}` }]);
    } finally {
      setAsking(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    ask(question);
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.length === 0 && (
        <div className="rounded-2xl bg-linear-to-br from-brand-soft to-surface p-5">
          <p className="flex items-center gap-2 font-semibold">
            <Sparkles size={18} className="text-brand" /> Ask Fred anything about this meeting
          </p>
          <p className="mt-1 text-sm text-fg-muted">Fred reads the transcript and answers with quotes you can jump to.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => ask(suggestion)}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium hover:border-brand hover:text-brand"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {messages.map((message, index) =>
        message.role === "user" ? (
          <div key={index} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-sm text-white">
            {message.text}
          </div>
        ) : (
          <div key={index} className="flex max-w-[95%] gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Sparkles size={14} />
            </span>
            <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-3 text-sm">
              <p className="whitespace-pre-line leading-relaxed">{message.text}</p>
              {!!message.sources?.length && (
                <div className="mt-3 space-y-1.5 border-t border-line pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">Sources</p>
                  {message.sources.map((source) => (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => onSeek(source.start_time)}
                      className="block w-full rounded-lg bg-surface-hover px-2.5 py-1.5 text-left text-xs hover:text-brand"
                    >
                      <span className="font-semibold">{source.speaker}</span>{" "}
                      <span className="tabular-nums text-brand">{formatTimestamp(source.start_time)}</span>
                      <span className="mt-0.5 line-clamp-2 block text-fg-muted">{source.text}</span>
                    </button>
                  ))}
                </div>
              )}
              {message.generatedBy && (
                <p className="mt-2 text-[10px] text-fg-subtle">
                  {message.generatedBy === "llm" ? "Answered by Claude" : "Answered by Fred's rule-based assistant"}
                </p>
              )}
            </div>
          </div>
        ),
      )}

      {asking && <p className="animate-pulse text-sm text-fg-muted">Fred is thinking…</p>}
      <div ref={bottomRef} />

      <form onSubmit={onSubmit} className="sticky bottom-0 flex gap-2 bg-surface pb-1 pt-2">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask a question about this meeting…"
          aria-label="Ask Fred"
          className="h-10 flex-1 rounded-xl border border-line bg-surface px-3.5 text-sm outline-none placeholder:text-fg-subtle focus:border-brand"
        />
        <button
          type="submit"
          aria-label="Send question"
          disabled={!question.trim() || asking}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white hover:bg-brand-hover disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

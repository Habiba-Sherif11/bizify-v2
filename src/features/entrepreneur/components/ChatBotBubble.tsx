"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Sparkles, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

// ─── Mock AI ─────────────────────────────────────────────────────────────────

function getMockReply(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("idea") || q.includes("idea"))
    return "Great question! Start by validating your idea with 5–10 customer interviews. The goal is to confirm the problem is real and people would pay to solve it. Head to your Ideas module to get started.";
  if (q.includes("team") || q.includes("cofounder"))
    return "Finding the right co-founder is one of the most important decisions you'll make. Look for complementary skills and shared values. Check your Teams module to manage who's on board.";
  if (q.includes("market") || q.includes("size"))
    return "Market sizing helps you understand the opportunity. Start with TAM (Total Addressable Market), then narrow to SAM and SOM. I can help you run a market analysis — just tell me your idea.";
  if (q.includes("fund") || q.includes("invest"))
    return "Most early-stage startups raise through friends, family, or angel investors. Your pitch deck should clearly show the problem, solution, market size, and traction. Want help drafting one?";
  if (q.includes("hello") || q.includes("hi"))
    return "Hey! 👋 I'm Bizify AI, your startup co-founder. Ask me anything about validating ideas, building your team, or growing your business.";
  return "I'm here to help you build your startup! Ask me about idea validation, market research, team building, fundraising, or product strategy.";
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChatBotBubble() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      text: "Hey! 👋 I'm Bizify AI. Ask me anything about building your startup.",
      time: now(),
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text, time: now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: getMockReply(text),
        time: now(),
      };
      setMessages((m) => [...m, reply]);
      setThinking(false);
    }, 1000 + Math.random() * 500);
  };

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className={cn(
          "fixed bottom-20 start-6 z-50",
          "w-[320px] sm:w-[360px]",
          "bg-white dark:bg-neutral-800",
          "rounded-2xl border border-neutral-200 dark:border-neutral-700",
          "shadow-2xl flex flex-col overflow-hidden",
          "animate-in slide-in-from-bottom-4 fade-in duration-200"
        )} style={{ height: 440 }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-cyan-500 to-cyan-600 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">Bizify AI</p>
                <p className="text-[10px] text-cyan-100 mt-0.5">Always here to help</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
            >
              <Minimize2 size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex gap-2", m.role === "user" && "flex-row-reverse")}>
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={11} className="text-cyan-600 dark:text-cyan-400" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-cyan-500 text-white rounded-tr-sm"
                    : "bg-neutral-100 dark:bg-neutral-700 text-gray-800 dark:text-gray-100 rounded-tl-sm"
                )}>
                  {m.text}
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center shrink-0">
                  <Sparkles size={11} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="px-3 py-2 rounded-2xl rounded-tl-sm bg-neutral-100 dark:bg-neutral-700 flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 shrink-0">
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-700 rounded-xl px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything…"
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 min-w-0"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || thinking}
                className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-white disabled:opacity-40 cursor-pointer shrink-0"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Chat with Bizify AI"
        className={cn(
          "fixed bottom-6 start-6 z-50",
          "w-12 h-12 rounded-full",
          "flex items-center justify-center text-white",
          "shadow-lg cursor-pointer",
          open
            ? "bg-neutral-700 dark:bg-neutral-600"
            : "bg-linear-to-br from-cyan-500 to-cyan-600 shadow-cyan-500/30"
        )}
      >
        {open ? <X size={20} /> : <Bot size={20} />}
      </button>
    </>
  );
}

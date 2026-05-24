"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGeneralChat } from "@/features/entrepreneur/hooks/useGeneralChat";

function AiAvatar({ size = "sm" }: { size?: "sm" | "xs" }) {
  const dim = size === "xs" ? "w-6 h-6" : "w-8 h-8";
  const svgSize = size === "xs" ? 11 : 14;
  return (
    <div className={cn(dim, "rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shrink-0 shadow-sm")}>
      <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 3Z"/>
        <path d="M20 12.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
      </svg>
    </div>
  );
}

export function ChatBotBubble() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const { messages, isLoading, sendMessage } = useGeneralChat();

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage(text);
  };

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className={cn(
            "fixed bottom-20 inset-s-6 z-50",
            "w-[calc(100vw-3rem)] max-w-80 sm:max-w-90",
            "bg-white dark:bg-neutral-800",
            "rounded-2xl border border-neutral-200 dark:border-neutral-700",
            "shadow-2xl flex flex-col overflow-hidden",
            "animate-in slide-in-from-bottom-4 fade-in duration-200"
          )}
          style={{ height: 440 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <AiAvatar size="sm" />
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-none">Bizify AI</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Always here to help</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
            >
              <Minimize2 size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex gap-2 items-start", m.role === "user" && "flex-row-reverse")}>
                {m.role === "assistant" && <AiAvatar size="xs" />}
                <div
                  className={cn(
                    "max-w-[80%] min-w-0 px-3 py-2 rounded-2xl text-sm leading-relaxed wrap-break-word whitespace-pre-wrap",
                    m.role === "user"
                      ? "bg-cyan-600/10 dark:bg-cyan-900/20 border border-neutral-200 dark:border-neutral-600 text-neutral-800 dark:text-gray-200 rounded-tr-sm"
                      : "bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-gray-200 rounded-tl-sm shadow-sm"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-start">
                <AiAvatar size="xs" />
                <div className="px-3 py-2 rounded-2xl rounded-tl-sm bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 shadow-sm flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-500 typing-dot"
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 shrink-0">
            <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600 px-3 py-2">
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
                disabled={!input.trim() || isLoading}
                className="w-7 h-7 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center text-white disabled:opacity-40 cursor-pointer shrink-0"
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
          "fixed bottom-6 inset-s-6 z-50",
          "w-12 h-12 rounded-full",
          "flex items-center justify-center text-white",
          "cursor-pointer transition-[transform,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "hover:scale-105 active:scale-95 shadow-lg",
          open
            ? "bg-neutral-700 dark:bg-neutral-600"
            : "bg-gradient-to-br from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600"
        )}
      >
        {open ? <X size={20} /> : <Bot size={20} />}
      </button>
    </>
  );
}

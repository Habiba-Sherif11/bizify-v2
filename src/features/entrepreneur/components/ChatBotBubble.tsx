"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
      <AnimatePresence>
      {open && (
        <motion.div
          className={cn(
            "fixed bottom-20 inset-s-6 z-50",
            "w-[calc(100vw-3rem)] max-w-80 sm:max-w-90",
            "bg-white dark:bg-neutral-800",
            "rounded-2xl border border-neutral-200 dark:border-neutral-700",
            "shadow-2xl flex flex-col overflow-hidden"
          )}
          style={{ height: 440 }}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-500 block"
                      animate={{ opacity: [0.25, 1, 0.25], scale: [0.75, 1.1, 0.75] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
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
        </motion.div>
      )}
      </AnimatePresence>

      {/* Floating trigger */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Chat with Bizify AI"
        className={cn(
          "fixed bottom-6 inset-s-6 z-50",
          "w-12 h-12 rounded-full",
          "flex items-center justify-center text-white",
          "cursor-pointer shadow-lg",
          open
            ? "bg-neutral-700 dark:bg-neutral-600"
            : "bg-gradient-to-br from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600"
        )}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open
            ? <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={20} /></motion.span>
            : <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Bot size={20} /></motion.span>
          }
        </AnimatePresence>
      </motion.button>
    </>
  );
}

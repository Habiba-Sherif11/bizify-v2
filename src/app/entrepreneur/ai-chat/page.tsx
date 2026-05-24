"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import {
  Home, ChevronRight, Send, Plus,
  MessageSquare, Trash2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { api } from "@/features/auth/lib/api";
import type { HistoryEntry } from "@/features/entrepreneur/hooks/useGeneralChat";
import { FLOATING_CONV_ID } from "@/features/entrepreneur/hooks/useGeneralChat";

const CREATE_IDEA_PATTERN = /create.*idea|add.*idea|save.*idea|new.*idea|make.*idea/i;

function extractIdeaTitle(text: string): string {
  const quoted = text.match(/["']([^"']+)["']/);
  if (quoted) return quoted[1];
  const afterKw = text.match(/(?:create|add|save|make|new)\s+(?:an?\s+)?idea\s+(?:called|named|titled|about)?\s*(.+)/i);
  if (afterKw) return afterKw[1].trim().replace(/[.!?]+$/, "").slice(0, 80);
  return text.slice(0, 60);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  date: string;
  messages: Message[];
  history: HistoryEntry[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ts() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Initial data ─────────────────────────────────────────────────────────────

// No hardcoded conversations — all sessions come from localStorage

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConversationItem({
  conv,
  active,
  onSelect,
  onDelete,
}: {
  conv: Conversation;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-colors",
        active
          ? "bg-amber-50 dark:bg-amber-900/20"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-700/50"
      )}
    >
      <MessageSquare
        size={15}
        className={cn("mt-0.5 shrink-0", active ? "text-amber-500" : "text-gray-400 dark:text-gray-500")}
      />
      <div className="flex-1 min-w-0">
        <p className={cn("text-xs font-medium truncate", active ? "text-amber-700 dark:text-amber-300" : "text-gray-700 dark:text-gray-200")}>
          {conv.id === FLOATING_CONV_ID ? "💬 Quick Chat" : conv.title}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">{conv.preview}</p>
      </div>
      <button
        type="button"
        title="Delete conversation"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-400 cursor-pointer shrink-0 transition-all"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-2.5 animate-in fade-in slide-in-from-bottom-1 duration-200", isUser && "flex-row-reverse")}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 3Z"/>
            <path d="M20 12.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
          </svg>
        </div>
      )}
      <div className={cn(
        "max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
        isUser
          ? "bg-cyan-600/10 dark:bg-cyan-900/20 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-gray-200 rounded-tr-sm"
          : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-gray-200 rounded-tl-sm shadow-sm"
      )}>
        {msg.text}
        <p className={cn("text-[10px] mt-1.5 opacity-60", isUser ? "text-right" : "text-left")}>
          {msg.time}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "bizify_ai_conversations";
const ACTIVE_KEY  = "bizify_ai_active_id";

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Conversation[];
      if (parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
}

function loadActiveId(conversations: Conversation[]): string {
  try {
    const saved = localStorage.getItem(ACTIVE_KEY);
    if (saved && conversations.some((c) => c.id === saved)) return saved;
  } catch {}
  return conversations[0]?.id ?? "";
}

function AiChatContent() {
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeId, setActiveId] = useState<string>(() => loadActiveId(loadConversations()));
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const autoSentRef = useRef(false);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  // Auto-create a first conversation when the list is empty
  useEffect(() => {
    if (conversations.length === 0) {
      const id = `c${Date.now()}`;
      setConversations([{
        id,
        title: "New conversation",
        preview: "Start a new conversation…",
        date: "Today",
        history: [],
        messages: [{ id: "0", role: "assistant", text: "Hi! I'm Bizify AI. What would you like to work on today?", time: ts() }],
      }]);
      setActiveId(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-read conversations from localStorage when the floating chat updates them
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue) as Conversation[];
          setConversations(updated);
        } catch {}
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations)); } catch {}
  }, [conversations]);

  useEffect(() => {
    try { localStorage.setItem(ACTIVE_KEY, activeId); } catch {}
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages, thinking]);

  const updateConversation = (id: string, patch: Partial<Conversation>) =>
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const handleSend = async () => {
    if (!active) return;
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text, time: ts() };
    const baseMessages = [...active.messages, userMsg];
    updateConversation(activeId, { messages: baseMessages, preview: text.slice(0, 40) });
    setInput("");
    setThinking(true);

    const newTitle = active.title === "New conversation" ? text.slice(0, 30) : active.title;

    try {
      // Create idea intent — POST only title + description (no extra fields)
      if (CREATE_IDEA_PATTERN.test(text)) {
        const title = extractIdeaTitle(text);
        await api.post("/ideas", { title, description: text });
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: `Done! I've created a new idea titled "${title}". You can find and manage it in your Ideas section.`,
          time: ts(),
        };
        updateConversation(activeId, { messages: [...baseMessages, assistantMsg], title: newTitle });
        return;
      }

      // All other messages — route through general-chat which handles intent server-side.
      // Pass the full history so the server can detect pending confirmations (<!--PENDING:...-->).
      const { data } = await api.post("/ai/general-chat", { message: text, history: active.history });
      const replyText: string = data.reply ?? "No response received";
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: replyText,
        time: ts(),
      };
      // Always preserve the full reply in history (including invisible <!--PENDING:--> markers)
      const updatedHistory: HistoryEntry[] = [
        ...active.history,
        { role: "user" as const, content: text },
        { role: "assistant" as const, content: replyText },
      ];
      updateConversation(activeId, {
        messages: [...baseMessages, assistantMsg],
        history: updatedHistory,
        title: newTitle,
      });

      // Auto-save to My Ideas when the AI generates an idea
      if (replyText.includes("💡")) {
        const ideaMatch = replyText.match(/💡\s*IDEA\s*[:\-]?\s*(.+)/i);
        if (ideaMatch) {
          fetch("/api/ideas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: ideaMatch[1].trim(), description: replyText }),
          }).catch(() => {});
        }
      }
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Sorry, I'm having trouble connecting right now. Please try again.",
        time: ts(),
      };
      updateConversation(activeId, { messages: [...baseMessages, errorMsg] });
    } finally {
      setThinking(false);
    }
  };

  const handleNewChat = () => {
    const id = `c${Date.now()}`;
    const newConv: Conversation = {
      id,
      title: "New conversation",
      preview: "Start a new conversation…",
      date: "Today",
      history: [],
      messages: [
        { id: "0", role: "assistant", text: "Hi! I'm Bizify AI. What would you like to work on today?", time: ts() },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(id);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleDelete = (id: string) => {
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);
    if (activeId === id) setActiveId(remaining[0]?.id ?? "");
  };

  // Pre-fill input with the query from the dashboard search bar (?q=...)
  useEffect(() => {
    const q = searchParams.get("q");
    if (!q || autoSentRef.current) return;
    autoSentRef.current = true;
    setInput(q);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [searchParams]);

  const grouped = Object.entries(
    conversations.reduce<Record<string, Conversation[]>>((acc, c) => {
      (acc[c.date] ??= []).push(c);
      return acc;
    }, {})
  );

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col transition-colors">
      {/* Breadcrumb row */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-3">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/entrepreneur" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer">
            <Home size={14} />
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200 font-medium">AI Chat</span>
        </nav>
      </div>

      {/* Two-column layout */}
      <div
        className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-6 flex gap-4 min-h-0"
        style={{ height: "calc(100vh - 110px)" }}
      >
        {/* ── Sidebar ── */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 gap-3">
          <button
            type="button"
            onClick={handleNewChat}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-amber-400 to-yellow-500 shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            New chat
          </button>

          <div className="flex-1 overflow-y-auto space-y-4 pr-0.5">
            {grouped.map(([date, convs]) => (
              <div key={date}>
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-3 mb-1">
                  {date}
                </p>
                <div className="space-y-0.5">
                  {convs.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      active={conv.id === activeId}
                      onSelect={() => setActiveId(conv.id)}
                      onDelete={() => handleDelete(conv.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main chat ── */}
        <div className="flex-1 flex flex-col bg-background dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden min-w-0">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-700 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 3Z"/>
                <path d="M20 12.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                {active?.title ?? "Bizify AI"}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">AI Co-founder · Always online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {active?.messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}

            {thinking && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 3Z"/>
                    <path d="M20 12.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
                  </svg>
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center gap-1">
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
          <div className="px-4 pb-4 shrink-0">
            <div className="flex items-end gap-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600 px-4 py-3">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="Ask anything — validate an idea, research a market, draft a pitch…"
                className="flex-1 text-sm bg-transparent outline-none resize-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 max-h-32 min-w-0"
                style={{ scrollbarWidth: "none" }}
              />
              <button
                type="button"
                title="Send message"
                onClick={handleSend}
                disabled={!input.trim() || thinking}
                className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center text-white disabled:opacity-40 cursor-pointer shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2">
              Bizify AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AiChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-100 dark:bg-neutral-900" />}>
      <AiChatContent />
    </Suspense>
  );
}

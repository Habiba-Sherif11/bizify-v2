"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import {
  Home, ChevronRight, Send, Plus,
  MessageSquare, Trash2, Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { api } from "@/features/auth/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

interface Session {
  id: string;
  section_slug: string | null;
  idea_id: string | null;
  title: string;
  preview: string;
  created_at: string;
  messages: Message[];
  history: { role: "user" | "assistant"; content: string }[];
  messagesLoaded: boolean;
}

const SECTION_LABEL: Record<string, string> = {
  customers:        "Customers",
  competition:      "Competition",
  "market-potential": "Market",
  "idea-strategy":  "Strategy",
  "business-model": "Business Model",
  "functions-list": "Functions",
  "mvp-planning":   "MVP",
  "unit-economics": "Financial",
  "go-to-market":   "Go-to-Market",
  problems:         "Risk",
};

function ts() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConversationItem({
  session,
  active,
  onSelect,
  onDelete,
}: {
  session: Session;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const sectionLabel = session.section_slug ? SECTION_LABEL[session.section_slug] : null;
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
        <div className="flex items-center gap-1.5">
          <p className={cn("text-xs font-medium truncate", active ? "text-amber-700 dark:text-amber-300" : "text-gray-700 dark:text-gray-200")}>
            {session.title}
          </p>
          {sectionLabel && (
            <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
              {sectionLabel}
            </span>
          )}
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">{session.preview || "Start a new conversation…"}</p>
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

function AiChatContent() {
  const searchParams = useSearchParams();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const autoSentRef = useRef(false);

  const active = sessions.find((s) => s.id === activeId) ?? sessions[0];

  // Load all sessions from DB on mount
  useEffect(() => {
    api.get("/chat/sessions")
      .then(({ data }) => {
        const loaded: Session[] = (data as Array<{ id: string; section_slug: string | null; idea_id: string | null; title: string; preview: string; created_at: string }>).map((s) => ({
          ...s,
          messages: [],
          history: [],
          messagesLoaded: false,
        }));

        // If no sessions, create a default general one
        if (loaded.length === 0) {
          return api.post("/chat/sessions", { title: "New conversation" }).then(({ data: newSession }) => {
            const s: Session = { ...newSession, messages: [
              { id: "0", role: "assistant", text: "Hi! I'm Bizify AI. What would you like to work on today?", time: ts() }
            ], history: [], messagesLoaded: true };
            setSessions([s]);
            setActiveId(s.id);
          });
        }

        setSessions(loaded);

        // Determine which session to open
        const paramId = searchParams.get("session_id");
        const target = paramId ? loaded.find((s) => s.id === paramId) : null;
        setActiveId(target?.id ?? loaded[0]?.id ?? "");
      })
      .catch(() => { setSessions([]); })
      .finally(() => setLoadingSessions(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load messages when active session changes
  useEffect(() => {
    if (!activeId) return;
    const session = sessions.find((s) => s.id === activeId);
    if (!session || session.messagesLoaded) return;

    api.get(`/chat/sessions/${activeId}/messages`)
      .then(({ data }) => {
        const msgs: Message[] = (data as Array<{ id: string; role: string; content: string; created_at: string }>).map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          text: m.content,
          time: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));
        const history = msgs.map((m) => ({ role: m.role, content: m.text }));

        setSessions((prev) => prev.map((s) => s.id === activeId
          ? {
              ...s,
              messages: msgs.length === 0
                ? [{ id: "0", role: "assistant", text: "Hi! I'm Bizify AI. What would you like to work on today?", time: ts() }]
                : msgs,
              history,
              messagesLoaded: true,
            }
          : s
        ));
      })
      .catch(() => {
        setSessions((prev) => prev.map((s) => s.id === activeId
          ? { ...s, messagesLoaded: true, messages: [{ id: "0", role: "assistant", text: "Hi! I'm Bizify AI. What would you like to work on today?", time: ts() }] }
          : s
        ));
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages, thinking]);

  const updateSession = (id: string, patch: Partial<Session>) =>
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const handleSend = async () => {
    if (!active) return;
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text, time: ts() };
    const baseMessages = [...(active.messages ?? []), userMsg];
    updateSession(activeId, { messages: baseMessages, preview: text.slice(0, 80) });
    setInput("");
    setThinking(true);

    const newTitle = active.title === "New conversation" ? text.slice(0, 30) : active.title;

    try {
      // Section-specific sessions use the section streaming chat API
      if (active.section_slug) {
        let assistantText = "";

        const response = await fetch(`/api/ai/${active.section_slug}/chat/stream`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: active.history,
            idea_id: active.idea_id ?? undefined,
          }),
        });

        const placeholderMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", text: "", time: ts() };
        updateSession(activeId, { messages: [...baseMessages, placeholderMsg] });

        if (response.ok && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const jsonStr = line.slice(6).trim();
              if (!jsonStr || jsonStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.type === "token" && parsed.content) {
                  assistantText += parsed.content;
                  setSessions((prev) => prev.map((s) => {
                    if (s.id !== activeId) return s;
                    const msgs = [...s.messages];
                    msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], text: assistantText };
                    return { ...s, messages: msgs };
                  }));
                }
              } catch { /* ignore */ }
            }
          }
        }

        const updatedHistory = [
          ...active.history,
          { role: "user" as const, content: text },
          { role: "assistant" as const, content: assistantText },
        ];
        updateSession(activeId, { history: updatedHistory, title: newTitle });

        // Save to DB
        if (assistantText) {
          api.post(`/chat/sessions/${activeId}/messages`, {
            messages: [
              { role: "user", content: text },
              { role: "assistant", content: assistantText },
            ],
          }).catch(() => {});
        }

        setThinking(false);
        return;
      }

      const { data } = await api.post("/ai/general-chat", { message: text, history: active.history });
      const replyText: string = data.reply ?? "No response received";
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", text: replyText, time: ts() };
      const updatedHistory = [
        ...active.history,
        { role: "user" as const, content: text },
        { role: "assistant" as const, content: replyText },
      ];
      updateSession(activeId, {
        messages: [...baseMessages, assistantMsg],
        history: updatedHistory,
        title: newTitle,
      });

      // Save to DB
      api.post(`/chat/sessions/${activeId}/messages`, {
        messages: [
          { role: "user", content: text },
          { role: "assistant", content: replyText },
        ],
      }).catch(() => {});

      // Notify Ideas list to refresh when an idea was generated
      if (data.action === "ran_sections" && (data.section === "idea" || data.section === "idea_intake")) {
        window.dispatchEvent(new CustomEvent("bizify:idea_created"));
      }

    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: "Sorry, I'm having trouble connecting right now. Please try again.",
        time: ts(),
      };
      updateSession(activeId, { messages: [...baseMessages, errorMsg] });
    } finally {
      setThinking(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const { data } = await api.post("/chat/sessions", { title: "New conversation" });
      const newSession: Session = {
        ...data,
        idea_id: data.idea_id ?? null,
        messages: [{ id: "0", role: "assistant", text: "Hi! I'm Bizify AI. What would you like to work on today?", time: ts() }],
        history: [],
        messagesLoaded: true,
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveId(newSession.id);
    } catch {
      // Fallback: local-only session
      const id = `c${Date.now()}`;
      const newSession: Session = {
        id,
        section_slug: null,
        idea_id: null,
        title: "New conversation",
        preview: "",
        created_at: new Date().toISOString(),
        messages: [{ id: "0", role: "assistant", text: "Hi! I'm Bizify AI. What would you like to work on today?", time: ts() }],
        history: [],
        messagesLoaded: true,
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveId(id);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleDelete = async (id: string) => {
    try { await api.delete(`/chat/sessions/${id}`); } catch { /* best-effort */ }
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (activeId === id) setActiveId(remaining[0]?.id ?? "");
  };

  // Pre-fill input with ?q= query param
  useEffect(() => {
    const q = searchParams.get("q");
    if (!q || autoSentRef.current) return;
    autoSentRef.current = true;
    setInput(q);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [searchParams]);

  const grouped = Object.entries(
    sessions.reduce<Record<string, Session[]>>((acc, s) => {
      const dateKey = formatDate(s.created_at);
      (acc[dateKey] ??= []).push(s);
      return acc;
    }, {})
  );

  const chatLabel = active?.section_slug
    ? `${SECTION_LABEL[active.section_slug] ?? active.section_slug} AI`
    : "Bizify AI";

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
        className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-6 flex gap-4 min-h-0 h-[calc(100vh-110px)]"
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
            {loadingSessions ? (
              <div className="flex items-center justify-center pt-8">
                <Loader2 size={16} className="animate-spin text-amber-400" />
              </div>
            ) : (
              grouped.map(([date, convs]) => (
                <div key={date}>
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide px-3 mb-1">
                    {date}
                  </p>
                  <div className="space-y-0.5">
                    {convs.map((session) => (
                      <ConversationItem
                        key={session.id}
                        session={session}
                        active={session.id === activeId}
                        onSelect={() => setActiveId(session.id)}
                        onDelete={() => handleDelete(session.id)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
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
                {active?.title ?? chatLabel}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                {active?.section_slug
                  ? `${SECTION_LABEL[active.section_slug] ?? active.section_slug} specialist · Always online`
                  : "AI Co-founder · Always online"}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
            {(!active || !active.messagesLoaded) ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 size={20} className="animate-spin text-amber-400" />
              </div>
            ) : (
              active.messages.map((m) => (
                <MessageBubble key={m.id} msg={m} />
              ))
            )}

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
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-500 typing-dot" />
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
                placeholder={active?.section_slug
                  ? `Ask about ${SECTION_LABEL[active.section_slug] ?? "this section"}…`
                  : "Ask anything — validate an idea, research a market, draft a pitch…"}
                className="flex-1 text-sm bg-transparent outline-none resize-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 max-h-32 min-w-0 [scrollbar-width:none]"
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

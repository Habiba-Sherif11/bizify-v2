"use client";

import { useState, useRef, useEffect } from "react";
import {
  Home, ChevronRight, Send, Plus, Bot,
  Sparkles, MessageSquare, Trash2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

function ts() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function aiReply(text: string): string {
  const q = text.toLowerCase();
  if (q.includes("market") || q.includes("size"))
    return "To size your market, start with a top-down approach: find the TAM (Total Addressable Market) from industry reports, then estimate your SAM and SOM based on your go-to-market constraints. For example, if the global food-delivery market is $150B, your SAM might be Egypt at ~$3B, and your realistic SOM in year 1 could be $30M. Want me to help model this for your specific idea?";
  if (q.includes("pitch") || q.includes("deck") || q.includes("investor"))
    return "A strong pitch deck has 10–12 slides: Problem → Solution → Market Size → Product Demo → Business Model → Traction → Team → Ask. Investors spend ~3 minutes on a cold deck, so lead with the most compelling hook — usually the problem or traction slide. What's your startup about? I can help you structure yours.";
  if (q.includes("idea") || q.includes("validate"))
    return "The fastest way to validate is the 5 Customer Conversations method: talk to 5 potential users in 48 hours. Ask about their current behaviour (not opinions). Listen for pain intensity and willingness to pay. If 3 out of 5 say they'd pay or refer, you have signal worth pursuing. What problem are you solving?";
  if (q.includes("team") || q.includes("cofounder"))
    return "The ideal founding team has 3 complementary profiles: a Hacker (builder), a Hustler (seller), and a Designer (UX/product thinker). Studies show 2-3 person founding teams raise 30% more funding than solo founders. What skills do you currently have on your team?";
  if (q.includes("fund") || q.includes("raise") || q.includes("investor"))
    return "At pre-seed stage, focus on angels and micro-VCs who invest in your region and vertical. Prepare a 1-page executive summary before your deck. Warm intros convert 10x better than cold outreach. Build in public to create inbound. What stage are you at and how much are you looking to raise?";
  return "Great question! As your AI co-founder, I can help you with idea validation, market research, competitive analysis, pitch preparation, team building, and go-to-market strategy. What specific challenge are you working through right now?";
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    title: "Validating Cafe Noir",
    preview: "How do I test if people would pay for…",
    date: "Today",
    messages: [
      { id: "1", role: "user",      text: "How do I test if people would pay for a specialty coffee subscription?", time: "09:14" },
      { id: "2", role: "assistant", text: "Great question! The fastest way to validate pricing is to create a simple landing page with a 'Pre-order for 10% off' CTA. If 3–5% of visitors convert to waitlist sign-ups, that's strong signal. You can also run 5 customer interviews asking about current coffee spending. What city are you targeting?", time: "09:14" },
      { id: "3", role: "user",      text: "Cairo, mainly Maadi and Zamalek areas.", time: "09:15" },
      { id: "4", role: "assistant", text: "Perfect — those are high-income, specialty-coffee-aware demographics. I'd estimate your TAM in those two areas at around $2M/year. Your biggest competitors would be Cilantro and imported brands like Nespresso. Your differentiation story should focus on curation + discovery. Want me to draft a customer interview script?", time: "09:15" },
    ],
  },
  {
    id: "c2",
    title: "Fundraising strategy",
    preview: "What slides should I focus on for…",
    date: "Yesterday",
    messages: [
      { id: "1", role: "user",      text: "What slides should I focus on for a pre-seed pitch?", time: "15:22" },
      { id: "2", role: "assistant", text: "For pre-seed, investors bet on the team and the problem, not the product. Prioritise: (1) Problem slide — make it visceral, use a story. (2) Team slide — show relevant experience and why you uniquely. (3) Traction — even early signals count. The rest is secondary. You have ~90 seconds per slide. Want me to review your current deck?", time: "15:23" },
    ],
  },
];

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
          ? "bg-cyan-50 dark:bg-cyan-900/20"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-700/50"
      )}
    >
      <MessageSquare
        size={15}
        className={cn("mt-0.5 shrink-0", active ? "text-cyan-500" : "text-gray-400 dark:text-gray-500")}
      />
      <div className="flex-1 min-w-0">
        <p className={cn("text-xs font-medium truncate", active ? "text-cyan-700 dark:text-cyan-300" : "text-gray-700 dark:text-gray-200")}>
          {conv.title}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">{conv.preview}</p>
      </div>
      <button
        type="button"
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
    <div className={cn("flex gap-2.5", isUser && "flex-row-reverse")}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-linear-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles size={13} className="text-white" />
        </div>
      )}
      <div className={cn(
        "max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
        isUser
          ? "bg-cyan-500 text-white rounded-tr-sm"
          : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 rounded-tl-sm shadow-sm"
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

export default function AiChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string>(INITIAL_CONVERSATIONS[0].id);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages, thinking]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text, time: ts() };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, userMsg], preview: text.slice(0, 40) }
          : c
      )
    );
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const reply: Message = { id: (Date.now() + 1).toString(), role: "assistant", text: aiReply(text), time: ts() };
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, messages: [...c.messages, reply] } : c))
      );
      setThinking(false);
    }, 900 + Math.random() * 600);
  };

  const handleNewChat = () => {
    const id = `c${Date.now()}`;
    const newConv: Conversation = {
      id,
      title: "New conversation",
      preview: "Start a new conversation…",
      date: "Today",
      messages: [
        { id: "0", role: "assistant", text: "Hi! I'm Bizify AI. What would you like to work on today?", time: ts() },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(id);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleDelete = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(conversations.find((c) => c.id !== id)?.id ?? "");
  };

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
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-6 flex gap-4 min-h-0" style={{ height: "calc(100vh - 110px)" }}>

        {/* ── Sidebar ── */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 gap-3">
          <button
            type="button"
            onClick={handleNewChat}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-linear-to-r from-cyan-500 to-cyan-600 shadow-sm cursor-pointer"
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
        <div className="flex-1 flex flex-col bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden min-w-0">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-700 shrink-0">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
              <Bot size={16} className="text-white" />
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
                <div className="w-7 h-7 rounded-full bg-linear-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={13} className="text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-500 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }} />
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
                onClick={handleSend}
                disabled={!input.trim() || thinking}
                className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white disabled:opacity-40 cursor-pointer shrink-0"
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

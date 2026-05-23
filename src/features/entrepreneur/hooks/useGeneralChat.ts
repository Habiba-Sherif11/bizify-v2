"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/features/auth/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
}

export interface HistoryEntry {
  role: "user" | "assistant";
  content: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// ID used to identify the floating-chat session inside bizify_ai_conversations
export const FLOATING_CONV_ID = "floating";
const CONVS_KEY = "bizify_ai_conversations";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "0",
  role: "assistant",
  text: "Hey! 👋 I'm Bizify AI. Ask me anything about building your startup.",
  time: formatTime(),
};

function loadFloatingSession(): { messages: ChatMessage[]; history: HistoryEntry[] } {
  if (typeof window === "undefined") return { messages: [WELCOME_MESSAGE], history: [] };
  try {
    const raw = localStorage.getItem(CONVS_KEY);
    if (raw) {
      const convs = JSON.parse(raw) as Array<{ id: string; messages?: ChatMessage[]; history?: HistoryEntry[] }>;
      const saved = convs.find((c) => c.id === FLOATING_CONV_ID);
      if (saved?.messages?.length) {
        return { messages: saved.messages, history: saved.history ?? [] };
      }
    }
  } catch {}
  return { messages: [WELCOME_MESSAGE], history: [] };
}

function persistFloatingSession(messages: ChatMessage[], history: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(CONVS_KEY);
    const convs: Array<Record<string, unknown>> = raw ? JSON.parse(raw) : [];
    const userMsgs = messages.filter((m) => m.role === "user");
    const title   = userMsgs[0]?.text.slice(0, 35) || "Bizify AI";
    const preview = messages[messages.length - 1]?.text.slice(0, 50) || "";
    const entry   = { id: FLOATING_CONV_ID, title, preview, date: "Today", messages, history };
    const idx = convs.findIndex((c) => c.id === FLOATING_CONV_ID);
    if (idx >= 0) convs[idx] = entry; else convs.push(entry);
    localStorage.setItem(CONVS_KEY, JSON.stringify(convs));
  } catch {}
}

function extractIdeaTitle(reply: string): string | null {
  const m = reply.match(/💡\s*IDEA\s*[:\-]?\s*(.+)/i);
  return m ? m[1].trim() : null;
}

async function saveIdeaToBackend(reply: string): Promise<void> {
  const title = extractIdeaTitle(reply);
  if (!title) return;
  try {
    await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: reply }),
    });
  } catch {
    // Non-critical
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGeneralChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadFloatingSession().messages);
  const [history,  setHistory]  = useState<HistoryEntry[]>(() => loadFloatingSession().history);
  const [isLoading, setIsLoading] = useState(false);

  // Persist to shared conversations store whenever messages/history change
  useEffect(() => {
    persistFloatingSession(messages, history);
  }, [messages, history]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        text: trimmed,
        time: formatTime(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const { data } = await api.post("/ai/general-chat", {
          message: trimmed,
          history,
        });

        // The backend returns: { reply, intent, section, action, ... }
        const replyText: string = data.reply ?? "";

        // Always preserve the full reply in history — it may contain invisible
        // <!--PENDING:...--> markers that the server uses to detect confirmations.
        setHistory((prev) => [
          ...prev,
          { role: "user",      content: trimmed },
          { role: "assistant", content: replyText },
        ]);

        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: replyText,
          time: formatTime(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Auto-save to My Ideas when the AI generates an idea
        if (replyText.includes("💡")) {
          saveIdeaToBackend(replyText);
        }

        // Notify useAiPipeline (same tab) to refresh sections after analysis runs
        if (data.action === "ran_sections" || data.intent === "run_section") {
          window.dispatchEvent(new CustomEvent("bizify:sections_updated"));
        }
      } catch {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: "Sorry, I'm having trouble connecting right now. Please try again.",
          time: formatTime(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [history, isLoading]
  );

  return { messages, isLoading, sendMessage };
}

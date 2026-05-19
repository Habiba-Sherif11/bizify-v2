"use client";

import { useState, useCallback } from "react";
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGeneralChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
          { role: "user", content: trimmed },
          { role: "assistant", content: replyText },
        ]);

        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: replyText,
          time: formatTime(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
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

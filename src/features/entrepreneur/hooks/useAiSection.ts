"use client";

import { useCallback, useState } from "react";
import { api } from "@/features/auth/lib/api";

export type ChatTurn = { role: "user" | "assistant"; content: string };

const SECTION_PATHS = {
  customers:       "customers",
  competition:     "competition",
  marketPotential: "market-potential",
  ideaStrategy:    "idea-strategy",
  businessModel:   "business-model",
  functionsList:   "functions-list",
  mvpPlanning:     "mvp-planning",
  unitEconomics:   "unit-economics",
  goToMarket:      "go-to-market",
} as const;

export type AiSectionKey = keyof typeof SECTION_PATHS;

/**
 * Hook for per-section AI actions: regenerate, regenerate-with-prompt, and chat.
 * Pair with useAiPipeline.fetchSection to refresh data after a successful action.
 */
export function useAiSection(key: AiSectionKey) {
  const path = SECTION_PATHS[key];
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const regenerate = useCallback(async () => {
    setIsRegenerating(true);
    try {
      await api.post(`/ai/${path}/regenerate`, {}, { timeout: 180_000 });
    } finally {
      setIsRegenerating(false);
    }
  }, [path]);

  const regenerateWithPrompt = useCallback(
    async (customPrompt: string) => {
      setIsRegenerating(true);
      try {
        await api.post(
          `/ai/${path}/regenerate-custom`,
          { custom_prompt: customPrompt },
          { timeout: 180_000 }
        );
      } finally {
        setIsRegenerating(false);
      }
    },
    [path]
  );

  const sendMessage = useCallback(
    async (message: string): Promise<string> => {
      const trimmed = message.trim();
      if (!trimmed) return "";
      setIsSendingMessage(true);
      try {
        const { data } = await api.post<{ reply?: string; response?: string; text?: string }>(
          `/ai/${path}/chat`,
          { message: trimmed, history: chatHistory },
          { timeout: 90_000 }
        );
        const reply = data.reply ?? data.response ?? data.text ?? "";
        setChatHistory((prev) => [
          ...prev,
          { role: "user", content: trimmed },
          { role: "assistant", content: reply },
        ]);
        return reply;
      } finally {
        setIsSendingMessage(false);
      }
    },
    [path, chatHistory]
  );

  const resetChat = useCallback(() => setChatHistory([]), []);

  return {
    isRegenerating,
    isSendingMessage,
    chatHistory,
    regenerate,
    regenerateWithPrompt,
    sendMessage,
    resetChat,
  };
}

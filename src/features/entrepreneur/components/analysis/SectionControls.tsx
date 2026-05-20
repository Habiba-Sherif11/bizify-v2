"use client";

import { useState } from "react";
import { Loader2, MessageSquare, RefreshCw, Send, Sparkles, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAiSection, type AiSectionKey, type ChatTurn } from "@/features/entrepreneur/hooks/useAiSection";
import { parseBackendError } from "@/lib/backend-error";

function errMsg(err: unknown, fallback: string) {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  return data ? parseBackendError(data) : fallback;
}

export function SectionControls({
  sectionKey,
  onRefresh,
}: {
  sectionKey: AiSectionKey;
  /** Called after a successful regenerate so the parent re-fetches the section. */
  onRefresh: () => void;
}) {
  const { isRegenerating, regenerate, regenerateWithPrompt } = useAiSection(sectionKey);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [prompt, setPrompt] = useState("");

  const handleRegenerate = async () => {
    try {
      await regenerate();
      toast.success("Regenerating — refreshing soon");
      onRefresh();
    } catch (err) {
      toast.error(errMsg(err, "Failed to regenerate"));
    }
  };

  const handleSubmitPrompt = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    try {
      await regenerateWithPrompt(trimmed);
      toast.success("Regenerating with your instructions");
      setShowPrompt(false);
      setPrompt("");
      onRefresh();
    } catch (err) {
      toast.error(errMsg(err, "Failed to regenerate"));
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2 mb-4">
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isRegenerating}
          title="Regenerate this section"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer disabled:opacity-50"
        >
          {isRegenerating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Regenerate
        </button>
        <button
          type="button"
          onClick={() => setShowPrompt(true)}
          disabled={isRegenerating}
          title="Regenerate with custom instructions"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer disabled:opacity-50"
        >
          <Sparkles size={12} />
          Refine
        </button>
        <button
          type="button"
          onClick={() => setShowChat(true)}
          title="Ask the AI about this section"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-500 to-yellow-500 text-white cursor-pointer"
        >
          <MessageSquare size={12} />
          Chat
        </button>
      </div>

      {showPrompt && (
        <PromptModal
          value={prompt}
          onChange={setPrompt}
          onSubmit={handleSubmitPrompt}
          onClose={() => setShowPrompt(false)}
          submitting={isRegenerating}
        />
      )}

      {showChat && (
        <SectionChatModal sectionKey={sectionKey} onClose={() => setShowChat(false)} />
      )}
    </>
  );
}

function PromptModal({
  value,
  onChange,
  onSubmit,
  onClose,
  submitting,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  submitting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-800 rounded-xl shadow-2xl flex flex-col">
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Refine with custom instructions
          </h3>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. Focus on enterprise customers in Europe, and add more pricing detail."
            rows={5}
            className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-sm outline-none focus:border-amber-400 resize-none"
          />
        </div>
        <div className="px-5 py-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!value.trim() || submitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-yellow-500 cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Regenerate"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionChatModal({
  sectionKey,
  onClose,
}: {
  sectionKey: AiSectionKey;
  onClose: () => void;
}) {
  const { sendMessage, chatHistory, isSendingMessage } = useAiSection(sectionKey);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatTurn[]>([]);

  const submit = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    try {
      const reply = await sendMessage(text);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      toast.error(errMsg(err, "Chat failed"));
    }
  };

  const display = messages.length > 0 ? messages : chatHistory;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl h-[70vh] bg-white dark:bg-neutral-800 rounded-xl shadow-2xl flex flex-col">
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Chat about this section
          </h3>
          <button type="button" onClick={onClose} className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {display.length === 0 ? (
            <div className="text-center py-12 text-sm text-neutral-500">
              Ask anything about this section — pricing, refinements, alternatives.
            </div>
          ) : (
            display.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                    m.role === "user"
                      ? "bg-amber-500 text-white"
                      : "bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
          {isSendingMessage && (
            <div className="flex justify-start">
              <div className="bg-neutral-100 dark:bg-neutral-700 rounded-2xl px-3 py-2 text-sm flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin text-amber-500" />
                <span className="text-neutral-500">Thinking…</span>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Type a message…"
            className="flex-1 h-10 px-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-sm outline-none focus:border-amber-400"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim() || isSendingMessage}
            className="h-10 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

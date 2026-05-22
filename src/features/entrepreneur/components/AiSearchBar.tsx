"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const SUGGESTIONS = [
  "Analyze my target market",
  "Draft a pitch deck outline",
  "Suggest validation experiments",
];

export function AiSearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    // Encode the query so the AI chat page can pre-fill it
    router.push(`/entrepreneur/ai-chat?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Input */}
      <div className="bg-background dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center gap-3 px-4 py-3">
        <label htmlFor="ai-search" className="sr-only">
          Ask Bizify
        </label>
        <Sparkles size={16} className="text-cyan-600 dark:text-cyan-400 shrink-0" aria-hidden="true" />
        <input
          id="ai-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(query)}
          placeholder="Ask Bizify anything — validate an idea, find a supplier, draft a pitch…"
          className="flex-1 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent outline-none min-w-0"
        />
        <button
          type="button"
          onClick={() => handleSubmit(query)}
          className="shrink-0 px-3 sm:px-4 py-2 min-h-11 rounded-lg text-xs font-medium text-white bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_12px_rgba(245,158,11,0.35)] hover:shadow-[0_2px_16px_rgba(245,158,11,0.5)] transition-shadow whitespace-nowrap cursor-pointer"
        >
          Ask AI
        </button>
      </div>

      {/* Suggestions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium shrink-0">
          Try:
        </span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSubmit(s)}
            className="px-3 py-1.5 rounded-full border border-amber-400/70 dark:border-amber-500/50 text-amber-600 dark:text-amber-400 text-[11px] font-medium bg-background dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/features/dashboard/context/LanguageContext";

interface Props {
  onSubmit?: (query: string) => void;
}

export function AiSearchBar({ onSubmit }: Props) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");

  const handleSubmit = (value: string) => {
    if (!value.trim()) return;
    onSubmit?.(value.trim());
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Input */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center gap-3 px-4 py-3">
        <Sparkles size={16} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(query)}
          placeholder={t.aiSearch.placeholder}
          className="flex-1 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent outline-none min-w-0"
        />
        <button
          type="button"
          onClick={() => handleSubmit(query)}
          className="shrink-0 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_12px_rgba(245,158,11,0.35)] hover:shadow-[0_2px_16px_rgba(245,158,11,0.5)] transition-shadow whitespace-nowrap cursor-pointer"
        >
          {t.aiSearch.askAI}
        </button>
      </div>

      {/* Suggestions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium shrink-0">
          {t.aiSearch.tryLabel}
        </span>
        {t.aiSearch.suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setQuery(s); onSubmit?.(s); }}
            className="px-2.5 sm:px-3 py-1 rounded-xl border border-amber-400 dark:border-amber-500/60 text-amber-500 dark:text-amber-400 text-[10px] font-medium uppercase tracking-wide bg-white dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

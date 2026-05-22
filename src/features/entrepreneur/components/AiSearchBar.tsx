"use client";

import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const SUGGESTIONS = [
  "Analyze my target market",
  "Draft a pitch deck outline",
  "Suggest validation experiments",
];

export function AiSearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const submit = (value: string) => {
    const v = value.trim();
    if (!v) return;
    router.push(`/entrepreneur/ai-chat?q=${encodeURIComponent(v)}`);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        className="
          flex items-center gap-3 sm:gap-4
          bg-card dark:bg-neutral-800
          border border-border dark:border-neutral-700
          rounded-2xl px-4 sm:px-5 py-3 sm:py-0
          sm:h-[72px]
          shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08),0_0_1px_rgba(0,0,0,0.06)]
          focus-within:border-cyan-500 dark:focus-within:border-cyan-500
          transition-colors
        "
      >
        <Search
          size={18}
          strokeWidth={1.75}
          className="text-neutral-400 dark:text-neutral-500 shrink-0"
        />
        <label htmlFor="ai-search" className="sr-only">Ask Bizify</label>
        <input
          id="ai-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit(query)}
          placeholder="Ask Bizify anything — validate an idea, find a supplier, draft a pitch…"
          className="
            flex-1 bg-transparent outline-none min-w-0
            text-sm sm:text-[15px]
            text-neutral-900 dark:text-white
            placeholder:text-neutral-400 dark:placeholder:text-neutral-500
          "
        />
        <button
          type="button"
          onClick={() => submit(query)}
          className="
            shrink-0 flex items-center gap-2
            h-[44px] sm:h-[52px] px-4 sm:px-5
            rounded-xl
            bg-linear-to-r from-amber-500 to-yellow-500
            hover:from-amber-400 hover:to-yellow-400
            text-[#1C1C1E] text-sm font-medium
            shadow-[0_2px_8px_rgba(245,158,11,0.4)] hover:shadow-[0_4px_12px_rgba(245,158,11,0.6)]
            transition-all duration-150
            cursor-pointer whitespace-nowrap
          "
        >
          Ask AI
          <ArrowRight size={14} strokeWidth={2} />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-neutral-400 dark:text-neutral-500 shrink-0">
          Try
        </span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => submit(s)}
            className="
              h-8 px-3.5 rounded-full
              border border-neutral-200 dark:border-neutral-700
              bg-card dark:bg-neutral-800
              text-[12px] sm:text-[13px] text-neutral-700 dark:text-neutral-300
              hover:bg-neutral-50 dark:hover:bg-neutral-700/60
              hover:border-neutral-300 dark:hover:border-neutral-600
              transition-colors cursor-pointer
            "
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

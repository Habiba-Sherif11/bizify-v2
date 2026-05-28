"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="flex flex-col gap-4 w-full">
      <div
        className="
          relative w-full h-14
          flex items-center gap-3
          bg-card dark:bg-neutral-800
          border border-border dark:border-neutral-700
          rounded-2xl px-4
          shadow-[0_1px_2px_-1px_rgba(0,0,0,0.10),0_1px_3px_rgba(0,0,0,0.10)]
          focus-within:border-cyan-500 dark:focus-within:border-cyan-500
          transition-colors
        "
      >
        <Search
          size={16}
          strokeWidth={1.75}
          className="text-neutral-400 dark:text-neutral-500 shrink-0"
        />
        <label htmlFor="ai-search" className="sr-only">Ask Bizify</label>
        <Input
          id="ai-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit(query)}
          placeholder="Ask Bizify anything — validate an idea, find a supplier, draft a pitch…"
          className="
            flex-1 bg-transparent border-0 shadow-none outline-none min-w-0 h-auto p-0
            text-sm focus-visible:ring-0 focus-visible:border-0
            text-neutral-900 dark:text-white
            placeholder:text-neutral-400 dark:placeholder:text-neutral-500
          "
        />
        <Button
          type="button"
          onClick={() => submit(query)}
          variant="primary-gradient"
          size="sm"
          className="shrink-0 h-8 px-3.5 rounded-lg whitespace-nowrap"
        >
          Ask AI
        </Button>
      </div>

      <div className="flex items-center gap-5 flex-wrap">
        <span className="text-[11px] font-normal tracking-[0.06em] uppercase text-neutral-400 dark:text-neutral-500 shrink-0">
          Try:
        </span>
        <div className="flex items-center gap-4 flex-wrap">
          {SUGGESTIONS.map((s) => (
            <Button
              key={s}
              type="button"
              variant="outline"
              onClick={() => submit(s)}
              className="
                px-3.5 py-1 rounded-xl h-auto
                border-amber-500
                text-[10px] font-medium uppercase tracking-wide leading-3
                text-amber-500
                hover:bg-amber-50 dark:hover:bg-amber-500/10
                bg-card dark:bg-neutral-800
              "
            >
              {s}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { type LucideIcon, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  count?: string;
  countNote?: string;
  aiSurface?: boolean;
  onClick?: () => void;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  count,
  countNote,
  aiSurface,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group text-left p-5 sm:p-6 min-h-40",
        "bg-card dark:bg-neutral-800",
        "border border-border dark:border-neutral-700",
        "rounded-xl flex flex-col gap-4",
        "shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08),_0_0_1px_rgba(0,0,0,0.06)]",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-1.5 hover:shadow-[0_20px_30px_-12px_rgba(0,0,0,0.15)]",
        "hover:border-amber-300/70 dark:hover:border-amber-400/40",
        "cursor-pointer"
      )}
    >
      {/* Icon tile — cyan-filled for AI surface, neutral for others */}
      <div
        className={cn(
          "w-10 h-10 rounded-[10px] border flex items-center justify-center shrink-0",
          aiSurface
            ? "bg-cyan-600 border-cyan-600 text-white"
            : "bg-neutral-100 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200"
        )}
      >
        <Icon size={18} strokeWidth={1.75} />
      </div>

      {/* Title + description */}
      <div className="flex flex-col gap-1 flex-1">
        <p className="text-[15px] font-semibold text-neutral-900 dark:text-white flex items-center gap-2 leading-snug">
          {title}
          {aiSurface && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0"
              aria-label="AI surface"
            />
          )}
        </p>
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-normal">
          {description}
        </p>
      </div>

      {/* Footer — count + arrow */}
      <div className="flex items-center justify-between mt-auto">
        {count && (
          <span className="text-[12px] text-neutral-700 dark:text-neutral-300 font-medium tabular-nums">
            {count}
            {countNote && (
              <span className="text-neutral-400 dark:text-neutral-500 font-normal"> {countNote}</span>
            )}
          </span>
        )}
        <ArrowUpRight
          size={15}
          strokeWidth={1.75}
          className={cn(
            "text-neutral-300 dark:text-neutral-600 ml-auto",
            "transition-all duration-200",
            "group-hover:text-amber-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          )}
        />
      </div>
    </button>
  );
}

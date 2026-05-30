"use client";

import { type LucideIcon, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CardAction {
  label: string;
  onClick: (e: React.MouseEvent) => void;
}

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  count?: string;
  countNote?: string;
  aiSurface?: boolean;
  variant?: "primary" | "compact";
  action?: CardAction;
  onClick?: () => void;
}

const baseCard = cn(
  "group text-left",
  "bg-card dark:bg-neutral-800",
  "border border-border dark:border-neutral-700",
  "rounded-xl",
  "shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08),_0_0_1px_rgba(0,0,0,0.06)]",
  "transition-all duration-200 ease-out",
  "hover:border-amber-300/70 dark:hover:border-amber-400/40",
  "cursor-pointer"
);

export function FeatureCard({
  icon: Icon,
  title,
  description,
  count,
  countNote,
  aiSurface,
  variant,
  action,
  onClick,
}: Props) {
  const isPrimary = variant === "primary";
  const isCompact = variant === "compact";

  // ── Compact: horizontal row layout ──────────────────────────────────────────
  if (isCompact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          baseCard,
          "flex items-center gap-3 p-4",
          "hover:-translate-y-1 hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.12)]"
        )}
      >
        <div
          className={cn(
            "w-9 h-9 rounded-[10px] border flex items-center justify-center shrink-0",
            aiSurface
              ? "bg-cyan-600 border-cyan-600 text-white"
              : "bg-neutral-100 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200"
          )}
        >
          <Icon size={15} strokeWidth={1.75} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-neutral-900 dark:text-white leading-snug truncate">
            {title}
          </p>
          <p className="text-[12px] text-neutral-500 dark:text-neutral-400 truncate leading-normal mt-0.5">
            {description}
          </p>
        </div>

        {count && (
          <span className="text-[12px] text-neutral-600 dark:text-neutral-400 font-medium tabular-nums shrink-0">
            {count}
            {countNote && (
              <span className="text-neutral-400 dark:text-neutral-500 font-normal"> {countNote}</span>
            )}
          </span>
        )}

        <ArrowUpRight
          size={14}
          strokeWidth={1.75}
          className="text-neutral-300 dark:text-neutral-600 shrink-0 transition-all duration-200 group-hover:text-amber-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </button>
    );
  }

  // ── Primary / default: vertical card ────────────────────────────────────────
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        baseCard,
        "flex flex-col",
        isPrimary
          ? "p-6 gap-4 min-h-52 hover:-translate-y-1.5 hover:shadow-[0_20px_30px_-12px_rgba(0,0,0,0.15)]"
          : "p-5 sm:p-6 gap-4 min-h-40 hover:-translate-y-1.5 hover:shadow-[0_20px_30px_-12px_rgba(0,0,0,0.15)]"
      )}
    >
      {/* Icon tile */}
      <div
        className={cn(
          "rounded-[10px] border flex items-center justify-center shrink-0",
          isPrimary ? "w-12 h-12" : "w-10 h-10",
          aiSurface
            ? "bg-cyan-600 border-cyan-600 text-white"
            : "bg-neutral-100 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200"
        )}
      >
        <Icon size={isPrimary ? 20 : 18} strokeWidth={1.75} />
      </div>

      {/* Title + description */}
      <div className="flex flex-col gap-1.5 flex-1">
        <p
          className={cn(
            "font-semibold text-neutral-900 dark:text-white flex items-center gap-2 leading-snug",
            isPrimary ? "text-[16px]" : "text-[15px]"
          )}
        >
          {title}
          {aiSurface && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0"
              aria-label="AI surface"
            />
          )}
        </p>
        <p
          className={cn(
            "text-neutral-500 dark:text-neutral-400 leading-relaxed",
            isPrimary ? "text-[14px]" : "text-[13px]"
          )}
        >
          {description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto gap-3">
        {count && (
          <span className="text-[12px] text-neutral-700 dark:text-neutral-300 font-medium tabular-nums">
            {count}
            {countNote && (
              <span className="text-neutral-400 dark:text-neutral-500 font-normal"> {countNote}</span>
            )}
          </span>
        )}

        {action ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(e);
            }}
            className="ml-auto h-7 px-3 text-[12px] rounded-lg border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 dark:border-amber-800/60 dark:text-amber-400 dark:hover:bg-amber-950/30"
          >
            {action.label}
          </Button>
        ) : (
          <ArrowUpRight
            size={15}
            strokeWidth={1.75}
            className={cn(
              "text-neutral-300 dark:text-neutral-600 ml-auto",
              "transition-all duration-200",
              "group-hover:text-amber-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            )}
          />
        )}
      </div>
    </button>
  );
}

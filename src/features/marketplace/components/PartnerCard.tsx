"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type PartnerType = "Supplier" | "Manufacturer" | "Mentor";

export interface PartnerCardProps {
  id: string;
  name: string;
  type: PartnerType;
  specialty: string;
  rating: number;       // 1–5
  reviewCount: number;
  description: string;
  tags: string[];
  avatarColor: string;  // Tailwind bg class
  onConnect?: () => void;
}

const TYPE_COLORS: Record<PartnerType, string> = {
  Supplier:     "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
  Manufacturer: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  Mentor:       "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          className={n <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-neutral-300 dark:text-neutral-600"}
        />
      ))}
    </div>
  );
}

export function PartnerCard({
  name,
  type,
  specialty,
  rating,
  reviewCount,
  description,
  tags,
  avatarColor,
  onConnect,
}: PartnerCardProps) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0",
          avatarColor
        )}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{specialty}</p>
            </div>
            <span className={cn("shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold", TYPE_COLORS[type])}>
              {type}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Stars rating={rating} />
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
        {description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-xs text-gray-500 dark:text-gray-400"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Connect button */}
      <button
        type="button"
        onClick={onConnect}
        className="w-full py-2 rounded-lg border border-cyan-500 dark:border-cyan-600 text-cyan-600 dark:text-cyan-400 text-sm font-medium cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
      >
        Connect
      </button>
    </div>
  );
}

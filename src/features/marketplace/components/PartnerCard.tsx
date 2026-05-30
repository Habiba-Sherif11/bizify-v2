"use client";

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export type PartnerType = "Supplier" | "Manufacturer" | "Mentor";

export interface PartnerCardProps {
  id: string;
  name: string;
  type: PartnerType;
  description: string;
  tags: string[];
  avatarColor: string;
  specialty?: string;
  phone?: string;
  category?: string;
  linkedinUrl?: string;
  headline?: string;
  country?: string;
  onClick?: () => void;
}

const TYPE_COLORS: Record<PartnerType, string> = {
  Supplier:     "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
  Manufacturer: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  Mentor:       "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
};

const CATEGORY_COLORS: Record<PartnerType, string> = {
  Supplier:     "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
  Manufacturer: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
  Mentor:       "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
};

export function PartnerCard({
  name,
  type,
  description,
  tags,
  avatarColor,
  category,
  headline,
  country,
  onClick,
}: PartnerCardProps) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
      className={cn(
        "bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm p-5 flex flex-col gap-3",
        onClick && "cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all"
      )}
    >
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
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{name}</h3>
            <span className={cn("shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold", TYPE_COLORS[type])}>
              {type}
            </span>
          </div>
          {headline && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{headline}</p>
          )}
          {category && (
            <span className={cn(
              "inline-block mt-1.5 px-2 py-0.5 rounded-full border text-[10px] font-medium",
              CATEGORY_COLORS[type]
            )}>
              {category}
            </span>
          )}
        </div>
      </div>

      {/* Short description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
        {description}
      </p>

      {/* Top 3 skills/tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-xs text-gray-500 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-xs text-gray-400 dark:text-gray-500">
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Country + view prompt */}
      <div className="flex items-center justify-between mt-auto pt-1">
        {country ? (
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <MapPin size={11} />
            {country}
          </span>
        ) : <span />}
        {onClick && (
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            View profile →
          </span>
        )}
      </div>
    </div>
  );
}

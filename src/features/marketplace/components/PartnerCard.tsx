"use client";

import { Phone } from "lucide-react";
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
}

const TYPE_COLORS: Record<PartnerType, string> = {
  Supplier:     "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
  Manufacturer: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  Mentor:       "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
};

export function PartnerCard({
  name,
  type,
  specialty,
  description,
  tags,
  avatarColor,
  phone,
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
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{name}</h3>
              {specialty && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{specialty}</p>
              )}
            </div>
            <span className={cn("shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold", TYPE_COLORS[type])}>
              {type}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
        {description}
      </p>

      {/* Tags */}
      {tags.length > 0 && (
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
      )}

      {/* Phone */}
      {phone ? (
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-gray-600 dark:text-gray-300 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
        >
          <Phone size={13} className="shrink-0 text-cyan-500" />
          <span className="truncate">{phone}</span>
        </a>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-gray-400 dark:text-gray-500">
          <Phone size={13} className="shrink-0" />
          <span>No phone provided</span>
        </div>
      )}
    </div>
  );
}

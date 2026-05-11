"use client";

import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
}

export interface TeamCardProps {
  id: string;
  name: string;
  date: string;
  description: string;
  members: Member[];
  overflowCount?: number;
  overflowColor?: "amber" | "cyan";
  onSettings?: () => void;
}

function MemberAvatar({ name }: { name: string }) {
  const initial = name.trim()[0]?.toUpperCase() ?? "?";
  return (
    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-800 bg-linear-to-br from-neutral-300 to-neutral-400 dark:from-neutral-600 dark:to-neutral-700 flex items-center justify-center text-[11px] font-semibold text-white -ms-2 first:ms-0 shrink-0">
      {initial}
    </div>
  );
}

export function TeamCard({
  name,
  date,
  description,
  members,
  overflowCount,
  overflowColor = "amber",
  onSettings,
}: TeamCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-6 truncate">
            {name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{date}</p>
        </div>
        <button
          type="button"
          onClick={onSettings}
          title="Team settings"
          className="w-7 h-7 flex items-center justify-center text-gray-400 dark:text-gray-500 cursor-pointer shrink-0 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          <Settings size={15} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 flex-1">
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
          {description}
        </p>

        {/* Stacked member avatars */}
        <div className="flex items-center">
          {members.map((m) => (
            <MemberAvatar key={m.id} name={m.name} />
          ))}
          {overflowCount != null && overflowCount > 0 && (
            <div
              className={cn(
                "w-8 h-8 rounded-full border-2 border-white dark:border-neutral-800",
                "flex items-center justify-center text-xs font-semibold text-white -ms-2",
                overflowColor === "amber" ? "bg-amber-500" : "bg-cyan-600"
              )}
            >
              +{overflowCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

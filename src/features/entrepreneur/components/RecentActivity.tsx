"use client";

import { type LucideIcon, Clock } from "lucide-react";

export interface ActivityItem {
  id: string;
  icon: LucideIcon;
  activity: string;
  module: "Ideas" | "AI chat" | "Team" | "Marketplace";
  time: string;
}

interface Props {
  items: ActivityItem[];
  onViewAll?: () => void;
}

export function RecentActivity({ items, onViewAll }: Props) {
  return (
    <div className="bg-card dark:bg-neutral-800 border border-border dark:border-neutral-700 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08),0_0_1px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-0">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500 dark:text-neutral-400">
          Recent activity
        </h2>
        {onViewAll && items.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-[12px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            View all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-10 flex flex-col items-center gap-3 text-center px-6">
          <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
            <Clock size={16} strokeWidth={1.75} className="text-neutral-400 dark:text-neutral-500" />
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Your first action will appear here.
          </p>
        </div>
      ) : (
        <ul className="list-none m-0 px-5 sm:px-6 pb-2 mt-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.id}
                className="
                  grid grid-cols-[36px_1fr_auto] sm:grid-cols-[36px_1fr_auto_auto]
                  items-center gap-3 sm:gap-4
                  py-3.5
                  border-b border-neutral-100 dark:border-neutral-700/60
                  last:border-b-0
                "
              >
                {/* Icon tile */}
                <span className="w-9 h-9 rounded-[10px] bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center text-neutral-600 dark:text-neutral-300 shrink-0">
                  <Icon size={15} strokeWidth={1.75} />
                </span>

                {/* Activity text */}
                <span className="text-sm text-neutral-800 dark:text-neutral-100 truncate">
                  {item.activity}
                </span>

                {/* Module pill */}
                <span className="hidden sm:inline-flex items-center gap-1.5 h-5.5 px-2.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 text-[11px] font-medium tracking-[0.02em] whitespace-nowrap shrink-0">
                  <span className="w-1.25 h-1.25 rounded-full bg-current opacity-60" />
                  {item.module}
                </span>

                {/* Time */}
                <span className="text-[12px] text-neutral-400 dark:text-neutral-500 tabular-nums whitespace-nowrap text-right shrink-0">
                  {item.time}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import { type LucideIcon, Clock } from "lucide-react";

export interface ActivityItem {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  activity: string;
  module: string;
  time: string;
}

interface Props {
  items: ActivityItem[];
  onViewAll?: () => void;
}

export function RecentActivity({ items, onViewAll }: Props) {
  return (
    <div
      className="bg-white dark:bg-neutral-800
                 border border-[#E9E9E9] dark:border-neutral-700
                 rounded-2xl p-5
                 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_0_1px_rgba(0,0,0,0.04)]
                 dark:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3),0_0_1px_rgba(0,0,0,0.2)]"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#1C1C1E] dark:text-white">
          Recent Activity
        </h2>
        {onViewAll && items.length > 0 && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs text-[#8C8C8C] dark:text-neutral-500
                       hover:text-[#1C1C1E] dark:hover:text-white transition-colors"
          >
            View all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-6 flex flex-col items-center gap-2.5 text-center">
          <div className="w-9 h-9 rounded-full bg-[#F5F5F5] dark:bg-neutral-700 flex items-center justify-center">
            <Clock size={16} className="text-[#8C8C8C] dark:text-neutral-500" aria-hidden="true" />
          </div>
          <p className="text-sm text-[#8C8C8C] dark:text-neutral-400 leading-snug">
            Your first action will appear here.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div
            className="absolute left-2.75 top-2 bottom-2 w-px bg-[#E9E9E9] dark:bg-neutral-700"
            aria-hidden="true"
          />

          <ol className="flex flex-col gap-5">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id} className="flex items-start gap-3 relative">
                  <div
                    className={`w-5.5 h-5.5 rounded-full flex items-center justify-center shrink-0 relative z-10 ${item.iconColor}`}
                    aria-hidden="true"
                  >
                    <Icon size={11} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm text-[#1C1C1E] dark:text-white leading-snug">{item.activity}</p>
                    <p className="text-[11px] text-[#8C8C8C] dark:text-neutral-500 mt-0.5">
                      {item.module}
                      <span className="mx-1.5 text-[#E9E9E9] dark:text-neutral-600">·</span>
                      {item.time}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

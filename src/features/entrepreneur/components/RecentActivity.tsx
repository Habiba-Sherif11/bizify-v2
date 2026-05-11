"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/features/dashboard/context/LanguageContext";

export interface ActivityItem {
  id: string;
  icon: LucideIcon;
  iconBg: string;
  activity: string;
  module: string;
  moduleBg: string;
  moduleBorder: string;
  moduleText: string;
  time: string;
}

interface Props {
  items: ActivityItem[];
  onViewAll?: () => void;
}

function ModuleBadge({ item }: { item: ActivityItem }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border",
        item.moduleBg,
        item.moduleBorder,
        item.moduleText
      )}
    >
      {item.module}
    </span>
  );
}

export function RecentActivity({ items, onViewAll }: Props) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-widest">
          {t.activity.title}
        </h2>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {t.activity.viewAll}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {/* Table head — 2-col on mobile, 3-col on sm+ */}
        <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_100px] border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/60">
          <div className="px-4 sm:px-5 py-3 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            {t.activity.headers.activity}
          </div>
          <div className="hidden sm:block px-3 py-3 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">
            {t.activity.headers.module}
          </div>
          <div className="px-4 sm:px-5 py-3" />
        </div>

        {/* Rows */}
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_100px] border-b border-zinc-100 dark:border-neutral-700/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-neutral-700/30 transition-colors"
            >
              {/* Activity */}
              <div className="px-4 sm:px-5 py-3 sm:py-3.5 flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                    item.iconBg
                  )}
                >
                  <Icon size={13} className="text-white" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm text-gray-800 dark:text-gray-100 block truncate">
                    {item.activity}
                  </span>
                  {/* Module badge shown inline on mobile only */}
                  <div className="mt-1 sm:hidden">
                    <ModuleBadge item={item} />
                  </div>
                </div>
              </div>

              {/* Module badge — desktop only */}
              <div className="hidden sm:flex px-3 py-3.5 items-center justify-center">
                <ModuleBadge item={item} />
              </div>

              {/* Time */}
              <div className="px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-end">
                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  {item.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

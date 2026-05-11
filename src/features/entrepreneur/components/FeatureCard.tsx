"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description: string;
  onClick?: () => void;
}

export function FeatureCard({ icon: Icon, iconClassName, title, description, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 sm:p-5",
        "bg-white dark:bg-neutral-800",
        "rounded-xl border border-neutral-200 dark:border-neutral-700",
        "shadow-sm hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-600",
        "transition-all group cursor-pointer"
      )}
    >
      <div className="flex flex-col gap-3 h-full">
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
            iconClassName ?? "bg-cyan-600"
          )}
        >
          <Icon size={18} className="text-white" />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
            {title}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  );
}

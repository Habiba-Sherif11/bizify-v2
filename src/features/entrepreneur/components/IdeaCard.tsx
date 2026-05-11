"use client";

import { Check, X, Clock, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type IdeaStatus = "verified" | "unverified" | "in-review";

export interface IdeaCardProps {
  id: string;
  title: string;
  date: string;
  status: IdeaStatus;
  description: string;
  category: string;
  categoryColor: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const STATUS_MAP: Record<
  IdeaStatus,
  { label: string; bg: string; Icon: React.ElementType }
> = {
  verified:   { label: "Verified",   bg: "bg-green-600", Icon: Check  },
  unverified: { label: "Unverified", bg: "bg-red-500",   Icon: X      },
  "in-review":{ label: "In Review",  bg: "bg-amber-500", Icon: Clock  },
};

export function IdeaCard({
  title,
  date,
  status,
  description,
  category,
  categoryColor,
  onEdit,
  onDelete,
}: IdeaCardProps) {
  const { label, bg, Icon } = STATUS_MAP[status];

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-6 truncate">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{date}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="w-7 h-7 flex items-center justify-center text-neutral-400 dark:text-neutral-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center text-neutral-400 dark:text-neutral-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Status badge */}
      <div
        className={cn(
          "self-start flex items-center gap-1 px-2 py-0.5 rounded-lg",
          bg
        )}
      >
        <Icon size={11} className="text-white" />
        <span className="text-xs font-semibold text-white leading-4">{label}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
        {description}
      </p>

      {/* Category tag */}
      <div
        className={cn(
          "self-start px-2.5 py-0.5 rounded-full",
          categoryColor
        )}
      >
        <span className="text-xs font-semibold text-white">{category}</span>
      </div>
    </div>
  );
}

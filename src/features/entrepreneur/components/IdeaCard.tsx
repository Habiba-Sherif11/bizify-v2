"use client";

import { Check, X, Clock, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type IdeaStatus = string;

export interface IdeaCardProps {
  id: string;
  title: string;
  date: string;
  status: IdeaStatus;
  description: string;
  skills?: string[];
  onEdit?: () => void;
  onDelete?: () => void;
}

const STATUS_MAP: Record<string, { label: string; bg: string; Icon: React.ElementType }> = {
  DRAFT:    { label: "Draft",    bg: "bg-amber-500", Icon: Clock  },
  ACTIVE:   { label: "Active",   bg: "bg-green-600", Icon: Check  },
  VERIFIED: { label: "Verified", bg: "bg-green-600", Icon: Check  },
  REJECTED: { label: "Rejected", bg: "bg-red-500",   Icon: X      },
};
const DEFAULT_STATUS = { label: "Draft", bg: "bg-amber-500", Icon: Clock };

export function IdeaCard({
  id,
  title,
  date,
  status,
  description,
  skills,
  onEdit,
  onDelete,
}: IdeaCardProps) {
  const { label, bg, Icon } = STATUS_MAP[status] ?? DEFAULT_STATUS;

  return (
    <div className="bg-background dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link
            href={`/entrepreneur/ideas/${id}`}
            className="text-base font-semibold text-gray-900 dark:text-white leading-6 truncate hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            {title}
          </Link>
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

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300"
            >
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-xs font-medium text-neutral-400">
              +{skills.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

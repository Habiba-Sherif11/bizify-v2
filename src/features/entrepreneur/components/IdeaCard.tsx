"use client";

import { useState, useRef, useEffect } from "react";
import { Check, X, Clock, MoreHorizontal, Pencil, Archive, ExternalLink, Heart } from "lucide-react";
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
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  // Selection mode (share / compare)
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
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
  skills,
  isFavorited = false,
  onToggleFavorite,
  onEdit,
  onDelete,
  isSelectable = false,
  isSelected = false,
  onSelect,
}: IdeaCardProps) {
  const { label, bg, Icon } = STATUS_MAP[status] ?? DEFAULT_STATUS;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [menuOpen]);

  return (
    <div
      onClick={isSelectable ? onSelect : undefined}
      className={cn(
        "bg-background dark:bg-neutral-800 rounded-xl border shadow-sm transition-all p-5 flex flex-col gap-3",
        isSelectable
          ? "cursor-pointer select-none"
          : "hover:shadow-md",
        isSelected
          ? "border-cyan-500 ring-2 ring-cyan-500/25 dark:border-cyan-500"
          : "border-neutral-200 dark:border-neutral-700"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {isSelectable ? (
            <p className="text-base font-semibold text-gray-900 dark:text-white leading-6 truncate">
              {title}
            </p>
          ) : (
            <Link
              href={`/entrepreneur/ideas/${id}`}
              className="text-base font-semibold text-gray-900 dark:text-white leading-6 truncate hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              {title}
            </Link>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{date}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isSelectable ? (
            /* Round checkbox */
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                isSelected
                  ? "bg-cyan-500 border-cyan-500"
                  : "border-neutral-300 dark:border-neutral-600"
              )}
            >
              {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
            </div>
          ) : (
            <>
              {/* Heart / favourite */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                <Heart
                  size={14}
                  className={cn(
                    "transition-colors",
                    isFavorited
                      ? "fill-red-500 text-red-500"
                      : "text-neutral-400 dark:text-neutral-500"
                  )}
                />
              </button>

              {/* 3-dots menu */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="w-7 h-7 flex items-center justify-center text-neutral-400 dark:text-neutral-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  <MoreHorizontal size={16} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link
                      href={`/entrepreneur/ideas/${id}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <ExternalLink size={14} className="text-neutral-400" />
                      View idea
                    </Link>
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); onEdit?.(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                    >
                      <Pencil size={14} className="text-neutral-400" />
                      Edit idea
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); onToggleFavorite?.(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                    >
                      <Heart size={14} className={cn(isFavorited ? "fill-red-500 text-red-500" : "text-neutral-400")} />
                      {isFavorited ? "Remove from favourites" : "Add to favourites"}
                    </button>
                    <div className="my-1 border-t border-neutral-100 dark:border-neutral-700" />
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); onDelete?.(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                    >
                      <Archive size={14} />
                      Archive idea
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status badge */}
      <div className={cn("self-start flex items-center gap-1 px-2 py-0.5 rounded-lg", bg)}>
        <Icon size={11} className="text-white" />
        <span className="text-xs font-semibold text-white leading-4">{label}</span>
      </div>

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

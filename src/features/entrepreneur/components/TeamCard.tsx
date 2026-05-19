"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
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
  onMenuClick?: (e: React.MouseEvent) => void;
  onDeleteClick?: (e: React.MouseEvent) => void;
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
  onMenuClick,
  onDeleteClick,
}: TeamCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuContainerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
        setDeleteConfirm(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
    setDeleteConfirm(false);
    onMenuClick?.(e);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setMenuOpen(false);
    setDeleteConfirm(false);
    onDeleteClick?.(e);
  };

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirm(false);
  };

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
        <div ref={menuContainerRef} className="relative shrink-0">
          <button
            type="button"
            onClick={handleMenuClick}
            title="Team options"
            className="w-7 h-7 flex items-center justify-center text-gray-400 dark:text-gray-500 cursor-pointer rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <MoreVertical size={15} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 min-w-30 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg p-1">
              {!deleteConfirm ? (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="w-full px-3 py-1.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md cursor-pointer"
                >
                  Delete
                </button>
              ) : (
                <div className="px-2 py-1.5 flex flex-col gap-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Are you sure?</p>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={handleDeleteCancel}
                      className="flex-1 px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-md cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-600"
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteClick}
                      className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded-md cursor-pointer hover:bg-red-700"
                    >
                      Yes
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
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

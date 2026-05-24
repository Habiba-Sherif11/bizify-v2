"use client";

import { useEffect } from "react";
import { X, ArchiveRestore, Loader2, Lightbulb } from "lucide-react";
import type { Idea } from "@/features/entrepreneur/types/idea";
import { formatIdeaDate } from "@/features/entrepreneur/hooks/useIdeas";

interface Props {
  ideas: Idea[];
  isLoading: boolean;
  onClose: () => void;
  onUnarchive: (id: string) => Promise<void>;
}

export function ArchivedIdeasDrawer({ ideas, isLoading, onClose, onUnarchive }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-700 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Archived Ideas</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {ideas.length} {ideas.length === 1 ? "idea" : "ideas"} archived
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center pt-20">
              <Loader2 size={24} className="animate-spin text-cyan-500" />
            </div>
          ) : ideas.length === 0 ? (
            <div className="flex flex-col items-center gap-3 pt-20 text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                <Lightbulb size={22} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">No archived ideas</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Ideas you archive will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ideas.map((idea) => (
                <ArchivedIdeaCard key={idea.id} idea={idea} onUnarchive={onUnarchive} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ArchivedIdeaCard({
  idea,
  onUnarchive,
}: {
  idea: Idea;
  onUnarchive: (id: string) => Promise<void>;
}) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white truncate">{idea.title ?? "Untitled idea"}</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatIdeaDate(idea.created_at)}</p>
        </div>
        {(() => {
          const raw = idea.skills;
          if (!raw) return null;
          // New SkillsGap dict format
          if (!Array.isArray(raw)) {
            const gap = raw as { your_skills?: string[]; skill_gaps?: string[] };
            const label = gap.your_skills?.[0] ?? gap.skill_gaps?.[0] ?? null;
            return label ? (
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                {label}
              </span>
            ) : null;
          }
          // Legacy array format
          if (raw.length === 0) return null;
          const s = raw[0];
          const label = typeof s.name === "string" ? s.name : String(Object.values(s)[0] ?? "");
          return label ? (
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300">
              {label}
            </span>
          ) : null;
        })()}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
        {idea.description ?? ""}
      </p>

      <button
        type="button"
        onClick={() => onUnarchive(idea.id)}
        className="flex items-center gap-1.5 self-start px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors cursor-pointer"
      >
        <ArchiveRestore size={12} />
        Restore
      </button>
    </div>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Home, ChevronRight, Loader2, AlertCircle, Clock, Check, X,
  Lightbulb, DollarSign, TrendingUp, Zap, Target, Users,
} from "lucide-react";
import { api } from "@/features/auth/lib/api";
import { formatIdeaDate } from "@/features/entrepreneur/hooks/useIdeas";
import type { Idea } from "@/features/entrepreneur/types/idea";
import { cn } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; bg: string; Icon: React.ElementType }> = {
  DRAFT:    { label: "Draft",    bg: "bg-amber-500",  Icon: Clock },
  ACTIVE:   { label: "Active",   bg: "bg-green-600",  Icon: Check },
  VERIFIED: { label: "Verified", bg: "bg-green-600",  Icon: Check },
  REJECTED: { label: "Rejected", bg: "bg-red-500",    Icon: X     },
};
const DEFAULT_STATUS = { label: "Draft", bg: "bg-amber-500", Icon: Clock };

function flattenSkills(skills: Idea["skills"]): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) {
    return skills.map((s) => (typeof s === "string" ? s : (s as Record<string,unknown>).name as string ?? "")).filter(Boolean);
  }
  const g = skills as { skill_gaps?: string[]; required_skills?: string[]; your_skills?: string[] };
  return [...(g.skill_gaps ?? []), ...(g.required_skills ?? []), ...(g.your_skills ?? [])].filter(Boolean);
}

function formatBudget(v: number | null): string {
  if (v == null) return "—";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function ScoreBar({ value, max = 10, color }: { value: number | null; max?: number; color: string }) {
  const pct = value != null ? Math.min(Math.max(value / max, 0), 1) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color, `w-[${pct}%]`)} />
      </div>
      <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 w-8 text-right">
        {value != null ? value.toFixed(1) : "—"}
      </span>
    </div>
  );
}

// ─── Idea column ─────────────────────────────────────────────────────────────

function IdeaColumn({ idea, rank }: { idea: Idea; rank: number }) {
  const status = STATUS_MAP[(idea.status ?? "draft").toUpperCase()] ?? DEFAULT_STATUS;
  const skills = flattenSkills(idea.skills);

  return (
    <div className="flex flex-col gap-5 min-w-0">
      {/* Header card */}
      <div className={cn(
        "bg-white dark:bg-neutral-800 rounded-2xl border shadow-sm p-5",
        rank === 1 ? "border-amber-400/60 ring-1 ring-amber-400/20" : "border-neutral-200 dark:border-neutral-700"
      )}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className={cn("self-start flex items-center gap-1 px-2 py-0.5 rounded-lg", status.bg)}>
            <status.Icon size={11} className="text-white" />
            <span className="text-xs font-semibold text-white">{status.label}</span>
          </div>
          {rank === 1 && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-700">
              <Zap size={9} /> Top score
            </span>
          )}
        </div>

        <Link
          href={`/entrepreneur/ideas/${idea.id}`}
          className="text-lg font-bold text-neutral-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors leading-tight block mb-1"
        >
          {idea.title ?? "Untitled idea"}
        </Link>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatIdeaDate(idea.created_at)}</p>

        {idea.description && (
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-3">
            {idea.description}
          </p>
        )}
      </div>

      {/* Scores card */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm p-5 flex flex-col gap-4">
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Scores & Budget</p>

        <div className="flex flex-col gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap size={12} className="text-amber-500" />
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Problem Validation</span>
            </div>
            <ScoreBar value={idea.problem_validation_score} color="bg-amber-400" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <TrendingUp size={12} className="text-cyan-500" />
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Feasibility</span>
            </div>
            <ScoreBar value={idea.feasibility} color="bg-cyan-400" />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-700">
            <div className="flex items-center gap-1.5">
              <DollarSign size={12} className="text-green-500" />
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Budget</span>
            </div>
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              {formatBudget(idea.budget)}
            </span>
          </div>
        </div>
      </div>

      {/* Skills card */}
      {skills.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm p-5">
          <div className="flex items-center gap-1.5 mb-3">
            <Users size={12} className="text-violet-500" />
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Skills Required</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 8).map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-xs font-medium text-neutral-600 dark:text-neutral-300"
              >
                {s}
              </span>
            ))}
            {skills.length > 8 && (
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-xs text-neutral-400">
                +{skills.length - 8}
              </span>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <Link
        href={`/entrepreneur/ideas/${idea.id}`}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-yellow-500 shadow-[0_2px_16px_rgba(255,183,3,0.25)] hover:from-amber-400 hover:to-yellow-400 transition-all"
      >
        <Target size={14} />
        View full analysis
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function CompareContent() {
  const searchParams = useSearchParams();
  const ids = (searchParams.get("ids") ?? "").split(",").filter(Boolean).slice(0, 3);

  const [ideas, setIdeas] = useState<(Idea | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ids.length < 2) { setLoading(false); return; }
    setLoading(true);
    Promise.all(ids.map((id) => api.get<Idea>(`/ideas/${id}`).then((r) => r.data).catch(() => null)))
      .then((results) => { setIdeas(results); setLoading(false); })
      .catch(() => { setError("Failed to load ideas"); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("ids")]);

  const validIdeas = ideas.filter((i): i is Idea => i !== null);

  // Rank by problem_validation_score then feasibility
  const ranked = [...validIdeas].sort((a, b) => {
    const sa = (a.problem_validation_score ?? 0) + (a.feasibility ?? 0);
    const sb = (b.problem_validation_score ?? 0) + (b.feasibility ?? 0);
    return sb - sa;
  });

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 pt-6 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/entrepreneur" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <Home size={14} />
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <Link href="/entrepreneur/ideas" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            Ideas
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200 font-medium">Compare</span>
        </nav>

        {/* Header */}
        <div className="mt-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-white">
            Compare Ideas
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Side-by-side comparison of {ids.length} idea{ids.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center pt-24">
            <Loader2 size={28} className="animate-spin text-cyan-500" />
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 pt-24 text-center">
            <AlertCircle size={24} className="text-red-400" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{error}</p>
            <Link href="/entrepreneur/ideas" className="text-sm text-cyan-600 hover:underline">
              Back to ideas
            </Link>
          </div>
        )}

        {!loading && !error && ids.length < 2 && (
          <div className="flex flex-col items-center gap-3 pt-24 text-center">
            <Lightbulb size={24} className="text-neutral-400" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Select at least 2 ideas to compare.</p>
            <Link href="/entrepreneur/ideas" className="text-sm text-cyan-600 hover:underline">
              Back to ideas
            </Link>
          </div>
        )}

        {!loading && !error && ranked.length >= 2 && (
          <div
            className={cn(
              "grid gap-6",
              ranked.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {ranked.map((idea, i) => (
              <IdeaColumn key={idea.id} idea={idea} rank={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-100 dark:bg-neutral-900" />}>
      <CompareContent />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { AlertTriangle, ExternalLink, ChevronDown, ChevronUp, Globe, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";
import { AiAnalysisSection } from "@/features/entrepreneur/components/AiAnalysisSection";

// ─── Types matching TwoProblemDiscovery output ────────────────────────────────

interface ProblemSource {
  url:   string;
  title: string;
}

interface Problem {
  id:                string;
  title:             string;
  description:       string;
  industry?:         string;
  target_customer?:  string;
  pain_level?:       "high" | "medium" | "low" | string;
  frequency?:        "high" | "medium" | "low" | string;
  current_solutions?: string;
  gap_opportunity?:  string;
  source_type?:      "web_sourced" | "profile_derived" | string;
  sources?:          string[];
  evidence?:         string[];
  validation_score?: number;
}

interface ProblemsData {
  problems?:        Problem[];
  summary_insight?: string;
  source_mode?:     "web_sourced" | "profile_derived" | string;
  sources_used?:    number;
  sources_list?:    ProblemSource[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function painColor(level?: string) {
  if (level === "high")   return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (level === "medium") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300";
}

function scoreColor(score: number) {
  if (score >= 70) return { bar: "bg-cyan-500",   text: "text-cyan-600 dark:text-cyan-400" };
  if (score >= 45) return { bar: "bg-amber-500",  text: "text-amber-600 dark:text-amber-400" };
  return               { bar: "bg-red-400",       text: "text-red-500" };
}

// ─── Single problem card ──────────────────────────────────────────────────────

function ProblemCard({ problem, index }: { problem: Problem; index: number }) {
  const [open, setOpen] = useState(false);
  const score = problem.validation_score ?? 0;
  const { bar, text } = scoreColor(score);
  const isWeb = problem.source_type !== "profile_derived";

  return (
    <div className="rounded-xl border border-border bg-white dark:bg-neutral-800/60 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 min-w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-snug">{problem.title}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {problem.pain_level && (
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize", painColor(problem.pain_level))}>
                  {problem.pain_level} pain
                </span>
              )}
              {problem.frequency && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 capitalize">
                  {problem.frequency} freq
                </span>
              )}
              <span className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                isWeb
                  ? "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400"
                  : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
              )}>
                {isWeb ? <Globe size={9} /> : <User size={9} />}
                {isWeb ? "Web sourced" : "Profile derived"}
              </span>
            </div>
          </div>
        </div>
        {/* Validation score pill */}
        <div className="flex flex-col items-end shrink-0 gap-1">
          <span className={cn("text-base font-bold leading-none", text)}>{score}</span>
          <span className="text-[9px] text-muted-foreground">/ 100</span>
        </div>
      </div>

      {/* Validation score bar */}
      <div className="h-1 bg-neutral-100 dark:bg-neutral-700">
        <div className={cn("h-full transition-all", bar)} style={{ width: `${Math.min(score, 100)}%` }} />
      </div>

      {/* Description */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-xs text-muted-foreground leading-relaxed">{problem.description}</p>
      </div>

      {/* Expandable details */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-[10px] text-muted-foreground hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-700/40 transition-colors cursor-pointer border-t border-border/50"
      >
        <span>{open ? "Hide details" : "Show gap, evidence & sources"}</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-border/50 pt-3">
          {problem.target_customer && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Target Customer</p>
              <p className="text-xs text-foreground">{problem.target_customer}</p>
            </div>
          )}
          {problem.current_solutions && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current Solutions People Use</p>
              <p className="text-xs text-foreground">{problem.current_solutions}</p>
            </div>
          )}
          {problem.gap_opportunity && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Market Gap</p>
              <p className="text-xs text-foreground">{problem.gap_opportunity}</p>
            </div>
          )}
          {problem.evidence && problem.evidence.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Evidence from the Web</p>
              <div className="flex flex-col gap-2">
                {problem.evidence.map((quote, i) => (
                  <blockquote key={i} className="border-l-2 border-amber-400 pl-3 text-xs text-muted-foreground italic leading-relaxed">
                    &ldquo;{quote}&rdquo;
                  </blockquote>
                ))}
              </div>
            </div>
          )}
          {problem.sources && problem.sources.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Sources</p>
              <div className="flex flex-col gap-1">
                {problem.sources.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 hover:underline truncate"
                  >
                    <ExternalLink size={10} className="shrink-0" />
                    <span className="truncate">{url}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sources footer ────────────────────────────────────────────────────────────

function SourcesFooter({ list, count, mode }: { list?: ProblemSource[]; count?: number; mode?: string }) {
  const [open, setOpen] = useState(false);
  if (!list || list.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/50 bg-neutral-50 dark:bg-neutral-800/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Globe size={13} />
          <span>
            {count ?? list.length} sources used
            {mode === "profile_derived" ? " (profile-based, no web search)" : " (web search)"}
          </span>
        </div>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && (
        <div className="border-t border-border/50 px-4 py-3 flex flex-col gap-1.5 max-h-48 overflow-y-auto">
          {list.map((src, i) => (
            <a
              key={i}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              <ExternalLink size={10} className="shrink-0" />
              <span className="truncate">{src.title || src.url}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function ProblemsSection({ data, isLoading, error }: SectionState) {
  if (!data || isLoading || error) {
    return (
      <AiAnalysisSection
        title="Problems"
        icon={<AlertTriangle size={16} />}
        data={data}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  let parsed: ProblemsData | null = null;
  try {
    const raw = JSON.parse(data);
    if (raw && typeof raw === "object" && !Array.isArray(raw)) parsed = raw as ProblemsData;
  } catch { /* fall through to generic renderer */ }

  if (!parsed || !parsed.problems?.length) {
    return (
      <AiAnalysisSection
        title="Problems"
        icon={<AlertTriangle size={16} />}
        data={data}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  const { problems, summary_insight, source_mode, sources_used, sources_list } = parsed;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <AlertTriangle size={16} />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Problems</h2>
        <span className="ml-1 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-xs text-muted-foreground">
          {problems.length} validated
        </span>
      </div>

      {summary_insight && (
        <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/30 bg-amber-50/60 dark:bg-amber-900/10 px-4 py-3">
          <p className="text-sm text-foreground leading-relaxed">{summary_insight}</p>
        </div>
      )}

      {/* Scoring legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" /> 70–100 Strong</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 45–69 Moderate</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> 0–44 Weak</span>
        <span className="ml-auto text-[10px]">Score = web sources × 25 + evidence × 15, capped at 85</span>
      </div>

      <div className="flex flex-col gap-3">
        {problems.map((p, i) => (
          <ProblemCard key={p.id ?? i} problem={p} index={i} />
        ))}
      </div>

      <SourcesFooter list={sources_list} count={sources_used} mode={source_mode} />
    </div>
  );
}

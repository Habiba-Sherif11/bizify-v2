"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload, FileText, Loader2, CheckCircle2, AlertTriangle,
  XCircle, AlertCircle, ChevronDown, ChevronUp, Download,
  ExternalLink, ShieldCheck, Info, RefreshCw, Clock, History,
  FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useValidation,
  type ValidationMode,
  type ValidationResult,
  type FactIssue,
  type ValidationHistoryItem,
} from "@/features/entrepreneur/hooks/useValidation";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ValidationPanelProps {
  sectionSlug: string;
  sectionLabel: string;
  ideaId: string;
  hasExistingAnalysis: boolean;
}

// ─── Overall score ring ───────────────────────────────────────────────────────

function OverallScore({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color =
    pct >= 80 ? "text-emerald-600 dark:text-emerald-400"
    : pct >= 60 ? "text-amber-600 dark:text-amber-400"
    : "text-red-500 dark:text-red-400";
  const ringColor =
    pct >= 80 ? "stroke-emerald-500"
    : pct >= 60 ? "stroke-amber-500"
    : "stroke-red-500";
  const grade =
    pct >= 80 ? "Excellent" : pct >= 65 ? "Good" : pct >= 50 ? "Fair" : "Needs Work";

  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-14 h-14 shrink-0">
        <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
          <circle cx="28" cy="28" r={r} strokeWidth="5" className="stroke-neutral-200 dark:stroke-neutral-700" fill="none" />
          <circle
            cx="28" cy="28" r={r} strokeWidth="5"
            className={cn("transition-all duration-700", ringColor)}
            fill="none"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <span className={cn("absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums", color)}>
          {Math.round(pct)}
        </span>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Overall Score</p>
        <p className={cn("text-lg font-bold", color)}>{grade}</p>
        <p className="text-xs text-muted-foreground">{pct} / 100</p>
      </div>
    </div>
  );
}

// ─── Score bar ────────────────────────────────────────────────────────────────

const SCORE_META: Record<string, { label: string; color: string; bg: string }> = {
  completeness: { label: "Completeness", color: "bg-blue-500",   bg: "bg-blue-50 dark:bg-blue-950/30" },
  accuracy:     { label: "Accuracy",     color: "bg-emerald-500",bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  depth:        { label: "Depth",        color: "bg-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
  structure:    { label: "Structure",    color: "bg-amber-500",  bg: "bg-amber-50 dark:bg-amber-950/30" },
};

function ScoreBar({ scoreKey, value, reasoning }: { scoreKey: string; value: number; reasoning: string }) {
  const [showReason, setShowReason] = useState(false);
  const meta = SCORE_META[scoreKey] ?? { label: scoreKey, color: "bg-gray-400", bg: "bg-gray-50" };
  const pct = Math.min(100, Math.max(0, value));
  const grade =
    pct >= 80 ? "text-emerald-600 dark:text-emerald-400"
    : pct >= 60 ? "text-amber-600 dark:text-amber-400"
    : "text-red-500 dark:text-red-400";

  return (
    <div className={cn("rounded-lg p-3", meta.bg)}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-foreground">{meta.label}</span>
        <div className="flex items-center gap-1.5">
          <span className={cn("text-sm font-bold tabular-nums", grade)}>{pct}/100</span>
          {reasoning && (
            <button
              onClick={() => setShowReason((v) => !v)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Why this score?"
            >
              <Info size={13} />
            </button>
          )}
        </div>
      </div>
      <div className="h-2 w-full bg-white/60 dark:bg-black/20 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", meta.color)} style={{ width: `${pct}%` }} />
      </div>
      {showReason && reasoning && (
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{reasoning}</p>
      )}
    </div>
  );
}

// ─── Fact issue card ──────────────────────────────────────────────────────────

const STATUS_CFG = {
  supported:  { icon: CheckCircle2,  cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" },
  outdated:   { icon: AlertTriangle, cls: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
  incorrect:  { icon: XCircle,       cls: "text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" },
  unverified: { icon: AlertCircle,   cls: "text-gray-500 bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700" },
} as const;

const STATUS_EXPLAIN: Record<string, string> = {
  supported:  "Found supporting evidence from reliable sources.",
  outdated:   "The claim was accurate historically but may no longer hold.",
  incorrect:  "Found contradicting evidence suggesting this claim is wrong.",
  unverified: "Could not find supporting or contradicting evidence in web search results.",
};

function FactIssueCard({ issue }: { issue: FactIssue }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[issue.status] ?? STATUS_CFG.unverified;
  const Icon = cfg.icon;
  const explain = STATUS_EXPLAIN[issue.status] ?? "";

  return (
    <div className={cn("rounded-lg border p-3 text-sm", cfg.cls)}>
      <div className="flex items-start gap-2 cursor-pointer" onClick={() => setOpen((v) => !v)}>
        <Icon size={15} className="shrink-0 mt-0.5" />
        <p className="flex-1 font-medium leading-snug">{issue.claim}</p>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-white/50 dark:bg-black/20">
          {issue.status}
        </span>
        {(issue.evidence.length > 0 || explain) && (
          open ? <ChevronUp size={13} className="shrink-0 mt-0.5" /> : <ChevronDown size={13} className="shrink-0 mt-0.5" />
        )}
      </div>
      {open && (
        <div className="mt-2 ml-5 flex flex-col gap-1.5">
          {explain && (
            <p className="text-xs opacity-80 italic">{explain}</p>
          )}
          {issue.evidence.map((ev, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs opacity-80">
              {ev.url ? (
                <a href={ev.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                  <ExternalLink size={11} />
                  {ev.source}
                </a>
              ) : (
                <span>{ev.source}</span>
              )}
              {ev.date && <span className="opacity-60">({ev.date})</span>}
            </div>
          ))}
          {issue.evidence.length === 0 && issue.status === "unverified" && (
            <p className="text-xs opacity-70">No search results matched this claim.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────

function UploadZone({ onFile, isLoading }: { onFile: (f: File) => void; isLoading: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file && file.type === "application/pdf") onFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => !isLoading && ref.current?.click()}
      className={cn(
        "border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors",
        isDragging
          ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
          : "border-neutral-300 dark:border-neutral-600 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/10",
        isLoading && "cursor-not-allowed opacity-60"
      )}
    >
      <input ref={ref} type="file" accept="application/pdf" className="hidden" disabled={isLoading} onChange={(e) => handleFiles(e.target.files)} />
      <Upload size={22} className="mx-auto mb-1.5 text-amber-500" />
      <p className="text-sm font-medium text-foreground">
        Drop your PDF here or <span className="text-amber-600 dark:text-amber-400 underline">browse</span>
      </p>
      <p className="text-xs text-muted-foreground mt-1">PDF only · max 15 MB</p>
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function CollapsibleSection({
  title, children, defaultOpen = false, badge,
}: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; badge?: string | number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {badge !== undefined && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-muted-foreground font-medium">
              {badge}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={15} className="text-muted-foreground shrink-0" /> : <ChevronDown size={15} className="text-muted-foreground shrink-0" />}
      </button>
      {open && <div className="px-4 py-3 bg-white dark:bg-neutral-900/40">{children}</div>}
    </div>
  );
}

// ─── File info bar ────────────────────────────────────────────────────────────

function FileInfoBar({ result }: { result: ValidationResult }) {
  const fileName = result.file_name || "Unknown file";
  const createdAt = result.created_at ? new Date(result.created_at) : null;
  const timeAgo = createdAt ? formatTimeAgo(createdAt) : "";

  return (
    <div className="flex items-center gap-2 flex-wrap rounded-lg bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2 text-xs text-muted-foreground">
      <FileText size={12} className="text-amber-500 shrink-0" />
      <span className="font-medium text-foreground truncate max-w-[180px]">{fileName}</span>
      <span className="text-neutral-300 dark:text-neutral-600">·</span>
      <span className="capitalize">{result.validation_mode === "bizify" ? "vs. Bizify Analysis" : "Industry Standards"}</span>
      {timeAgo && (
        <>
          <span className="text-neutral-300 dark:text-neutral-600">·</span>
          <span className="flex items-center gap-1"><Clock size={11} />{timeAgo}</span>
        </>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

// ─── History panel ────────────────────────────────────────────────────────────

function HistoryPanel({
  history,
  onLoad,
}: {
  history: ValidationHistoryItem[];
  onLoad: (id: string, mode: ValidationMode) => void;
}) {
  if (history.length === 0) return null;

  return (
    <CollapsibleSection title="Validation History" badge={history.length}>
      <div className="flex flex-col gap-1.5">
        {history.map((item) => {
          const score = item.overall_score ?? null;
          const modeLabel = item.validation_mode === "bizify" ? "vs. Bizify" : "Industry";
          const createdAt = item.created_at ? new Date(item.created_at) : null;
          const timeAgo = createdAt ? formatTimeAgo(createdAt) : "";
          const isOk = !item.section_mismatch;

          return (
            <button
              key={item.validation_id}
              onClick={() => isOk && onLoad(item.validation_id, item.validation_mode)}
              disabled={!isOk}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs text-left w-full transition-colors",
                isOk
                  ? "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer"
                  : "border-neutral-100 dark:border-neutral-800 opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <History size={11} className="shrink-0 text-muted-foreground" />
                <span className="font-medium text-foreground truncate max-w-[140px]">
                  {item.file_name || "Unknown file"}
                </span>
                <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted-foreground">
                  {modeLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-muted-foreground">
                {score !== null && (
                  <span className={cn(
                    "font-bold tabular-nums",
                    score >= 80 ? "text-emerald-600 dark:text-emerald-400"
                    : score >= 60 ? "text-amber-600 dark:text-amber-400"
                    : "text-red-500"
                  )}>
                    {Math.round(score)}
                  </span>
                )}
                {item.section_mismatch && <span className="text-red-400">Mismatch</span>}
                {timeAgo && <span>{timeAgo}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}

// ─── Mode results view ────────────────────────────────────────────────────────

function ModeResults({
  result,
  sectionSlug,
  onDownloadPdf,
  onDownloadDocx,
  onRevalidate,
}: {
  result: ValidationResult;
  sectionSlug: string;
  onDownloadPdf: () => void;
  onDownloadDocx: () => void;
  onRevalidate: () => void;
}) {
  const [showComparison, setShowComparison] = useState(false);
  const scoreReasoning = (result.score_reasoning ?? {}) as unknown as Record<string, string>;

  return (
    <div className="flex flex-col gap-4">
      {/* File info + revalidate */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <FileInfoBar result={result} />
        <button
          onClick={onRevalidate}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <RefreshCw size={12} />
          Revalidate
        </button>
      </div>

      {/* Overall score + dimension scores */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 flex flex-col gap-4">
        <OverallScore score={result.overall_score ?? 0} />
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(result.scores ?? {}).map(([key, val]) => (
            <ScoreBar key={key} scoreKey={key} value={val as number} reasoning={scoreReasoning[key] ?? ""} />
          ))}
        </div>
      </div>

      {/* Missing elements */}
      {result.missing_elements?.length > 0 && (
        <CollapsibleSection title="Missing Elements" badge={result.missing_elements.length} defaultOpen>
          <ul className="flex flex-col gap-1.5">
            {result.missing_elements.map((el, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <XCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
                {el}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Weak points */}
      {result.weak_points?.length > 0 && (
        <CollapsibleSection title="Weak Points" badge={result.weak_points.length} defaultOpen>
          <div className="flex flex-col gap-2.5">
            {result.weak_points.map((wp, i) => (
              <div key={i} className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{wp.point}</p>
                {wp.suggestion && (
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                    <span className="font-semibold">Fix: </span>{wp.suggestion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Fact-check */}
      {result.fact_issues?.length > 0 && (
        <CollapsibleSection title="Fact-Check Results" badge={result.fact_issues.length}>
          <div className="flex flex-col gap-2">
            {result.fact_issues.map((fi, i) => (
              <FactIssueCard key={i} issue={fi} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Improvement suggestions */}
      {result.improvement_suggestions?.length > 0 && (
        <CollapsibleSection title="Improvement Suggestions" defaultOpen>
          <ol className="flex flex-col gap-2">
            {result.improvement_suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </CollapsibleSection>
      )}

      {/* Gaps vs Bizify */}
      {result.missing_vs_bizify?.length > 0 && (
        <CollapsibleSection title="Gaps vs. Bizify Analysis" badge={result.missing_vs_bizify.length}>
          <ul className="flex flex-col gap-1.5">
            {result.missing_vs_bizify.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-violet-400" />
                {item}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {/* Improved content preview */}
      {result.improved_content && (
        <CollapsibleSection title="Improved Version Preview" defaultOpen>
          <div className="flex flex-col gap-3">
            {/* Toggle: issues vs improved */}
            <div className="flex rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 text-xs">
              <button
                onClick={() => setShowComparison(false)}
                className={cn(
                  "flex-1 py-1.5 px-2 font-medium transition-colors",
                  !showComparison
                    ? "bg-amber-500 text-white"
                    : "bg-white dark:bg-neutral-800 text-muted-foreground hover:bg-neutral-50 dark:hover:bg-neutral-700"
                )}
              >
                Summary
              </button>
              <button
                onClick={() => setShowComparison(true)}
                className={cn(
                  "flex-1 py-1.5 px-2 font-medium transition-colors",
                  showComparison
                    ? "bg-amber-500 text-white"
                    : "bg-white dark:bg-neutral-800 text-muted-foreground hover:bg-neutral-50 dark:hover:bg-neutral-700"
                )}
              >
                Full Analysis
              </button>
            </div>

            {!showComparison ? (
              <>
                {result.improved_content.summary && (
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {result.improved_content.summary}
                  </p>
                )}
                {result.improved_content.key_improvements?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                      Key Improvements Applied
                    </p>
                    <ul className="flex flex-col gap-1">
                      {result.improved_content.key_improvements.map((imp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-emerald-500" />
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto pr-1">
                {result.improved_content.full_analysis
                  ? result.improved_content.full_analysis
                  : <span className="text-muted-foreground italic">Full analysis not available for this result.</span>
                }
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Download buttons */}
      <div className="flex gap-2">
        {result.improved_pdf_b64 && (
          <button
            onClick={onDownloadPdf}
            className="flex items-center justify-center gap-2 flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 text-sm transition-colors"
          >
            <Download size={14} />
            Download PDF
          </button>
        )}
        {result.improved_docx_b64 && (
          <button
            onClick={onDownloadDocx}
            className="flex items-center justify-center gap-2 flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 text-sm transition-colors"
          >
            <FileDown size={14} />
            Download DOCX
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Mode upload form ─────────────────────────────────────────────────────────

function ModeUploadForm({
  mode,
  sectionLabel,
  hasExistingAnalysis,
  isLoading,
  error,
  onSubmit,
}: {
  mode: ValidationMode;
  sectionLabel: string;
  hasExistingAnalysis: boolean;
  isLoading: boolean;
  error: string | null;
  onSubmit: (file: File) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const isDisabled = mode === "bizify" && !hasExistingAnalysis;

  if (isDisabled) {
    return (
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 text-center text-sm text-muted-foreground">
        <AlertTriangle size={16} className="mx-auto mb-1.5 text-amber-400" />
        Generate the <span className="font-semibold">{sectionLabel}</span> with Bizify first, then validate your document against it.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <UploadZone onFile={setSelectedFile} isLoading={isLoading} />

      {selectedFile && (
        <div className="flex items-center justify-between rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-foreground min-w-0">
            <FileText size={13} className="shrink-0 text-amber-500" />
            <span className="truncate">{selectedFile.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
          </div>
          <button onClick={() => setSelectedFile(null)} className="text-muted-foreground hover:text-foreground ml-2 shrink-0">
            <XCircle size={13} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <button
        onClick={() => selectedFile && onSubmit(selectedFile)}
        disabled={!selectedFile || isLoading}
        className={cn(
          "flex items-center justify-center gap-2 w-full rounded-xl py-2.5 font-semibold text-sm transition-colors",
          selectedFile && !isLoading
            ? "bg-amber-500 hover:bg-amber-600 text-white"
            : "bg-neutral-200 dark:bg-neutral-700 text-muted-foreground cursor-not-allowed"
        )}
      >
        {isLoading ? (
          <><Loader2 size={14} className="animate-spin" />Analyzing document…</>
        ) : (
          <><ShieldCheck size={14} />Validate Document</>
        )}
      </button>

      {isLoading && (
        <p className="text-xs text-center text-muted-foreground">
          This may take 30–60 seconds. AI is reading your PDF, fact-checking claims, and writing the analysis.
        </p>
      )}
    </div>
  );
}

// ─── Special case: section mismatch ──────────────────────────────────────────

function MismatchBanner({ result, onReset }: { result: ValidationResult; onReset: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
        <XCircle size={15} />
        <span className="font-semibold text-sm">Wrong Document Type</span>
      </div>
      <p className="text-sm text-red-700 dark:text-red-300">{result.message}</p>
      <button onClick={onReset} className="self-start text-xs text-red-600 dark:text-red-400 underline">
        Try another file
      </button>
    </div>
  );
}

// ─── Single mode panel (used twice) ──────────────────────────────────────────

function ModePanelContent({
  mode,
  label,
  result,
  isLoading,
  error,
  sectionSlug,
  sectionLabel,
  hasExistingAnalysis,
  onValidate,
  onRevalidate,
  onDownloadPdf,
  onDownloadDocx,
}: {
  mode: ValidationMode;
  label: string;
  result: ValidationResult | null;
  isLoading: boolean;
  error: string | null;
  sectionSlug: string;
  sectionLabel: string;
  hasExistingAnalysis: boolean;
  onValidate: (file: File) => void;
  onRevalidate: () => void;
  onDownloadPdf: (b64: string) => void;
  onDownloadDocx: (b64: string) => void;
}) {
  if (result?.section_mismatch) {
    return <MismatchBanner result={result} onReset={onRevalidate} />;
  }

  if (result?.needs_generation) {
    return (
      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <AlertTriangle size={15} />
          <span className="font-semibold text-sm">No Bizify Analysis Yet</span>
        </div>
        <p className="text-sm text-amber-700 dark:text-amber-300">{result.message}</p>
        <button onClick={onRevalidate} className="self-start text-xs text-amber-600 dark:text-amber-400 underline">
          Switch to Industry Standards
        </button>
      </div>
    );
  }

  if (result && !result.section_mismatch && !result.needs_generation) {
    return (
      <ModeResults
        result={result}
        sectionSlug={sectionSlug}
        onDownloadPdf={() => result.improved_pdf_b64 && onDownloadPdf(result.improved_pdf_b64)}
        onDownloadDocx={() => result.improved_docx_b64 && onDownloadDocx(result.improved_docx_b64)}
        onRevalidate={onRevalidate}
      />
    );
  }

  return (
    <ModeUploadForm
      mode={mode}
      sectionLabel={sectionLabel}
      hasExistingAnalysis={hasExistingAnalysis}
      isLoading={isLoading}
      error={error}
      onSubmit={onValidate}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ValidationPanel({
  sectionSlug,
  sectionLabel,
  ideaId,
  hasExistingAnalysis,
}: ValidationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMode, setActiveMode] = useState<ValidationMode>("generic");
  // Track per-mode revalidation state (override result to null to show upload form)
  const [revalidating, setRevalidating] = useState<Partial<Record<ValidationMode, boolean>>>({});

  const {
    genericResult, genericLoading, genericError,
    bizifyResult,  bizifyLoading,  bizifyError,
    history, historyLoading,
    validate, fetchResult, clearResult, downloadPdf, downloadDocx,
  } = useValidation(sectionSlug, ideaId);

  const handleValidate = useCallback(
    async (file: File, mode: ValidationMode) => {
      setRevalidating((r) => ({ ...r, [mode]: false }));
      await validate(file, mode);
    },
    [validate]
  );

  const handleRevalidate = useCallback((mode: ValidationMode) => {
    clearResult(mode);
    setRevalidating((r) => ({ ...r, [mode]: true }));
  }, [clearResult]);

  const handleLoadHistory = useCallback(
    (id: string, mode: ValidationMode) => {
      setActiveMode(mode);
      setIsExpanded(true);
      fetchResult(id, mode);
    },
    [fetchResult]
  );

  const modeConfig: Record<ValidationMode, { label: string; result: ValidationResult | null; isLoading: boolean; error: string | null }> = {
    generic: { label: "Industry Standards", result: genericResult, isLoading: genericLoading, error: genericError },
    bizify:  { label: "vs. Bizify Analysis", result: bizifyResult,  isLoading: bizifyLoading,  error: bizifyError  },
  };

  const hasAnyResult = !!(genericResult || bizifyResult);
  const activeModeData = modeConfig[activeMode];
  const showUploadForm = !activeModeData.result || revalidating[activeMode];

  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900/40 overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <FileText size={15} className="text-amber-500" />
          <span className="text-sm font-semibold text-foreground">Validate Your Own {sectionLabel} Document</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-medium">
            AI Review
          </span>
          {hasAnyResult && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-medium">
              {[genericResult && "Industry", bizifyResult && "Bizify"].filter(Boolean).join(" + ")} validated
            </span>
          )}
        </div>
        {isExpanded
          ? <ChevronUp size={15} className="text-muted-foreground shrink-0" />
          : <ChevronDown size={15} className="text-muted-foreground shrink-0" />
        }
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-neutral-200 dark:border-neutral-700 pt-4">
          {/* Mode tabs */}
          <div className="flex rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 text-sm">
            {(["generic", "bizify"] as ValidationMode[]).map((m) => {
              const cfg = modeConfig[m];
              const hasResult = !!cfg.result;
              return (
                <button
                  key={m}
                  onClick={() => setActiveMode(m)}
                  className={cn(
                    "flex-1 py-2.5 px-3 font-medium transition-colors flex items-center justify-center gap-1.5",
                    activeMode === m
                      ? "bg-amber-500 text-white"
                      : "bg-white dark:bg-neutral-800 text-muted-foreground hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  )}
                >
                  {cfg.label}
                  {hasResult && (
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      activeMode === m ? "bg-white/70" : "bg-emerald-500"
                    )} />
                  )}
                  {cfg.isLoading && <Loader2 size={11} className={cn("animate-spin", activeMode === m ? "text-white" : "text-amber-500")} />}
                </button>
              );
            })}
          </div>

          {/* Mode description */}
          <p className="text-xs text-muted-foreground -mt-2">
            {activeMode === "generic"
              ? "Validates against industry best practices and current web research."
              : "Compares your document against the analysis Bizify generated for this section."}
          </p>

          {/* Active mode content */}
          <ModePanelContent
            mode={activeMode}
            label={modeConfig[activeMode].label}
            result={showUploadForm ? null : modeConfig[activeMode].result}
            isLoading={modeConfig[activeMode].isLoading}
            error={modeConfig[activeMode].error}
            sectionSlug={sectionSlug}
            sectionLabel={sectionLabel}
            hasExistingAnalysis={hasExistingAnalysis}
            onValidate={(file) => handleValidate(file, activeMode)}
            onRevalidate={() => handleRevalidate(activeMode)}
            onDownloadPdf={(b64) => downloadPdf(b64, sectionSlug)}
            onDownloadDocx={(b64) => downloadDocx(b64, sectionSlug)}
          />

          {/* History panel */}
          {!historyLoading && (
            <HistoryPanel history={history} onLoad={handleLoadHistory} />
          )}
          {historyLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 size={11} className="animate-spin" />
              Loading history…
            </div>
          )}
        </div>
      )}
    </div>
  );
}

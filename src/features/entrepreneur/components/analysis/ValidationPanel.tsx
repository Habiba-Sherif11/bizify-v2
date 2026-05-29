"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload, FileText, Loader2, CheckCircle2, AlertTriangle,
  XCircle, AlertCircle, ChevronDown, ChevronUp, Download,
  ExternalLink, ShieldCheck, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useValidation,
  type ValidationMode,
  type ValidationResult,
  type FactIssue,
} from "@/features/entrepreneur/hooks/useValidation";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ValidationPanelProps {
  sectionSlug: string;
  sectionLabel: string;
  ideaId: string;
  hasExistingAnalysis: boolean;
}

// ─── Score bar ────────────────────────────────────────────────────────────────

const SCORE_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  completeness: { label: "Completeness", color: "bg-blue-500",   bg: "bg-blue-50 dark:bg-blue-950/30" },
  accuracy:     { label: "Accuracy",     color: "bg-emerald-500",bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  depth:        { label: "Depth",        color: "bg-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
  structure:    { label: "Structure",    color: "bg-amber-500",  bg: "bg-amber-50 dark:bg-amber-950/30" },
};

function ScoreBar({
  scoreKey,
  value,
  reasoning,
}: {
  scoreKey: string;
  value: number;
  reasoning: string;
}) {
  const [showReason, setShowReason] = useState(false);
  const meta = SCORE_META[scoreKey] ?? { label: scoreKey, color: "bg-gray-400", bg: "bg-gray-50" };
  const pct = Math.min(100, Math.max(0, value));
  const grade = pct >= 80 ? "text-emerald-600 dark:text-emerald-400"
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
        <div
          className={cn("h-full rounded-full transition-all duration-700", meta.color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showReason && reasoning && (
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{reasoning}</p>
      )}
    </div>
  );
}

// ─── Fact issue badge ─────────────────────────────────────────────────────────

const STATUS_CFG = {
  supported:  { icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800" },
  outdated:   { icon: AlertTriangle, cls: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800" },
  incorrect:  { icon: XCircle, cls: "text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800" },
  unverified: { icon: AlertCircle,  cls: "text-gray-500 bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700" },
} as const;

function FactIssueCard({ issue }: { issue: FactIssue }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[issue.status] ?? STATUS_CFG.unverified;
  const Icon = cfg.icon;

  return (
    <div className={cn("rounded-lg border p-3 text-sm", cfg.cls)}>
      <div
        className="flex items-start gap-2 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon size={15} className="shrink-0 mt-0.5" />
        <p className="flex-1 font-medium leading-snug">{issue.claim}</p>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-white/50 dark:bg-black/20">
          {issue.status}
        </span>
        {issue.evidence.length > 0 && (open ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
      </div>
      {open && issue.evidence.length > 0 && (
        <div className="mt-2 ml-5 flex flex-col gap-1">
          {issue.evidence.map((ev, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs opacity-80">
              {ev.url ? (
                <a
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:underline"
                >
                  <ExternalLink size={11} />
                  {ev.source}
                </a>
              ) : (
                <span>{ev.source}</span>
              )}
              {ev.date && <span className="opacity-60">({ev.date})</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────

function UploadZone({
  onFile,
  isLoading,
}: {
  onFile: (f: File) => void;
  isLoading: boolean;
}) {
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
        "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
        isDragging
          ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
          : "border-neutral-300 dark:border-neutral-600 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/10",
        isLoading && "cursor-not-allowed opacity-60"
      )}
    >
      <input
        ref={ref}
        type="file"
        accept="application/pdf"
        className="hidden"
        disabled={isLoading}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Upload size={24} className="mx-auto mb-2 text-amber-500" />
      <p className="text-sm font-medium text-foreground">
        Drop your PDF here or <span className="text-amber-600 dark:text-amber-400 underline">browse</span>
      </p>
      <p className="text-xs text-muted-foreground mt-1">PDF only · max 15 MB</p>
    </div>
  );
}

// ─── Results view ─────────────────────────────────────────────────────────────

function ValidationResults({
  result,
  onDownloadPdf,
  onReset,
}: {
  result: ValidationResult;
  onDownloadPdf: () => void;
  onReset: () => void;
}) {
  const [showImproved, setShowImproved] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-amber-500" />
          <span className="font-semibold text-foreground text-sm">
            Validation complete — {result.section_name}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted-foreground">
            {result.validation_mode === "bizify" ? "vs. Bizify Analysis" : "Industry Standards"}
          </span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Validate another
        </button>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(result.scores).map(([key, val]) => (
          <ScoreBar
            key={key}
            scoreKey={key}
            value={val as number}
            reasoning={(result.score_reasoning as unknown as Record<string, string>)?.[key] ?? ""}
          />
        ))}
      </div>

      {/* Missing elements */}
      {result.missing_elements.length > 0 && (
        <CollapsibleSection title={`Missing Elements (${result.missing_elements.length})`} defaultOpen>
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
      {result.weak_points.length > 0 && (
        <CollapsibleSection title={`Weak Points (${result.weak_points.length})`} defaultOpen>
          <div className="flex flex-col gap-3">
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

      {/* Fact issues */}
      {result.fact_issues.length > 0 && (
        <CollapsibleSection title={`Fact-Check Results (${result.fact_issues.length})`}>
          <div className="flex flex-col gap-2">
            {result.fact_issues.map((fi, i) => (
              <FactIssueCard key={i} issue={fi} />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Improvement suggestions */}
      {result.improvement_suggestions.length > 0 && (
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

      {/* Missing vs Bizify (mode 2 only) */}
      {result.missing_vs_bizify && result.missing_vs_bizify.length > 0 && (
        <CollapsibleSection title={`Gaps vs. Bizify Analysis (${result.missing_vs_bizify.length})`}>
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
      {result.improved_content?.summary && (
        <CollapsibleSection
          title="Improved Version Preview"
          open={showImproved}
          onToggle={() => setShowImproved((v) => !v)}
        >
          <div className="flex flex-col gap-3">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {result.improved_content.summary}
            </p>
            {result.improved_content.key_improvements.length > 0 && (
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
          </div>
        </CollapsibleSection>
      )}

      {/* Download button */}
      {result.improved_pdf_b64 && (
        <button
          onClick={onDownloadPdf}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 transition-colors"
        >
          <Download size={16} />
          Download Improved PDF
        </button>
      )}
    </div>
  );
}

// ─── Collapsible helper ───────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: () => void;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const toggle = onToggle ?? (() => setInternalOpen((v) => !v));

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {isOpen ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
      </button>
      {isOpen && <div className="px-4 py-3 bg-white dark:bg-neutral-900/40">{children}</div>}
    </div>
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
  const [mode, setMode] = useState<ValidationMode>("generic");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { isLoading, error, result, validate, downloadPdf, clearResult } =
    useValidation(sectionSlug, ideaId);

  const handleFile = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedFile) return;
    await validate(selectedFile, mode);
  }, [selectedFile, mode, validate]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    clearResult();
  }, [clearResult]);

  const handleDownload = useCallback(() => {
    if (result?.improved_pdf_b64) {
      downloadPdf(result.improved_pdf_b64, sectionSlug);
    }
  }, [result, downloadPdf, sectionSlug]);

  // ── Special case: section mismatch ──────────────────────────────────────────
  const isMismatch = result?.section_mismatch;
  // ── Special case: needs generation ──────────────────────────────────────────
  const needsGen = result?.needs_generation;

  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900/40 overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <FileText size={16} className="text-amber-500" />
          <span className="text-sm font-semibold text-foreground">Validate Your Own {sectionLabel} Document</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-medium">
            AI Review
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={15} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown size={15} className="text-muted-foreground shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-neutral-200 dark:border-neutral-700 pt-4">
          {/* Show results if we have a valid result */}
          {result && !isMismatch && !needsGen ? (
            <ValidationResults
              result={result}
              onDownloadPdf={handleDownload}
              onReset={handleReset}
            />
          ) : (
            <>
              {/* Mismatch error */}
              {isMismatch && (
                <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircle size={16} />
                    <span className="font-semibold text-sm">Wrong Document Type</span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300">{result.message}</p>
                  <button
                    onClick={handleReset}
                    className="self-start text-xs text-red-600 dark:text-red-400 underline"
                  >
                    Try another file
                  </button>
                </div>
              )}

              {/* Needs generation */}
              {needsGen && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={16} />
                    <span className="font-semibold text-sm">No Bizify Analysis Yet</span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300">{result.message}</p>
                  <button
                    onClick={handleReset}
                    className="self-start text-xs text-amber-600 dark:text-amber-400 underline"
                  >
                    Switch to Industry Standards mode
                  </button>
                </div>
              )}

              {/* Upload form */}
              {!isMismatch && !needsGen && (
                <>
                  {/* Mode selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      Validation Mode
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 text-sm">
                      {(["generic", "bizify"] as ValidationMode[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => setMode(m)}
                          disabled={m === "bizify" && !hasExistingAnalysis}
                          className={cn(
                            "flex-1 py-2.5 px-3 font-medium transition-colors",
                            mode === m
                              ? "bg-amber-500 text-white"
                              : "bg-white dark:bg-neutral-800 text-muted-foreground hover:bg-neutral-50 dark:hover:bg-neutral-700",
                            m === "bizify" && !hasExistingAnalysis && "opacity-40 cursor-not-allowed"
                          )}
                          title={
                            m === "bizify" && !hasExistingAnalysis
                              ? `Generate the ${sectionLabel} with Bizify first`
                              : undefined
                          }
                        >
                          {m === "generic" ? "Industry Standards" : "vs. Bizify Analysis"}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {mode === "generic"
                        ? "Validates against industry best practices and current web research."
                        : "Compares your document against the analysis Bizify generated for this section."}
                    </p>
                  </div>

                  {/* Upload zone */}
                  <UploadZone onFile={handleFile} isLoading={isLoading} />

                  {/* Selected file indicator */}
                  {selectedFile && (
                    <div className="flex items-center justify-between rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2">
                      <div className="flex items-center gap-2 text-sm text-foreground min-w-0">
                        <FileText size={14} className="shrink-0 text-amber-500" />
                        <span className="truncate">{selectedFile.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          ({(selectedFile.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-muted-foreground hover:text-foreground ml-2 shrink-0"
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  )}

                  {/* Error message */}
                  {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedFile || isLoading}
                    className={cn(
                      "flex items-center justify-center gap-2 w-full rounded-xl py-3 font-semibold text-sm transition-colors",
                      selectedFile && !isLoading
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : "bg-neutral-200 dark:bg-neutral-700 text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Analyzing your document…
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={15} />
                        Validate Document
                      </>
                    )}
                  </button>

                  {isLoading && (
                    <p className="text-xs text-center text-muted-foreground">
                      This may take 30–60 seconds. The AI is reading your PDF, searching for facts, and writing the analysis.
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

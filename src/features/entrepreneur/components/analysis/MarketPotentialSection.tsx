"use client";

import { BarChart2, AlertCircle, CheckCircle2, XCircle, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MarketSize {
  value?: number | string;
  unit?: string;
  methodology?: string;
  reasoning?: string;
}

interface TimingAssessment {
  is_right_time?: boolean;
  reasoning?: string;
}

interface PestelFactor {
  factor?: string;
  impact?: string;
  description?: string;
  implication?: string;
}

interface PestelAnalysis {
  political?: PestelFactor | string;
  economic?: PestelFactor | string;
  social?: PestelFactor | string;
  technological?: PestelFactor | string;
  environmental?: PestelFactor | string;
  legal?: PestelFactor | string;
  [key: string]: PestelFactor | string | undefined;
}

interface MarketData {
  market_definition?: string;
  tam?: MarketSize;
  sam?: MarketSize;
  som?: MarketSize;
  timing_assessment?: TimingAssessment;
  pestel_analysis?: PestelAnalysis;
  opportunity_score?: number | string;
  opportunity_attractiveness?: string;
  summary?: string;
  sources_list?: { url: string; title: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseMarketData(raw: string): MarketData | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as MarketData;
  } catch { /* not JSON */ }
  return null;
}

function formatMarketValue(size: MarketSize): string {
  const val = size.value;
  const unit = size.unit ?? "";
  if (val === undefined || val === null) return "—";
  return `${val}${unit ? " " + unit : ""}`;
}

function pestelFactorText(factor: PestelFactor | string | undefined): { description: string; impact: string } {
  if (!factor) return { description: "", impact: "" };
  if (typeof factor === "string") return { description: factor, impact: "" };
  return {
    description: factor.description ?? factor.implication ?? "",
    impact: factor.impact ?? factor.factor ?? "",
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MarketFunnel({ tam, sam, som }: { tam?: MarketSize; sam?: MarketSize; som?: MarketSize }) {
  const tiers = [
    { label: "TAM", sublabel: "Total Addressable Market", size: tam, color: "border-blue-500 bg-blue-50 dark:bg-blue-900/10", textColor: "text-blue-700 dark:text-blue-300", widthClass: "w-full" },
    { label: "SAM", sublabel: "Serviceable Addressable Market", size: sam, color: "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/10", textColor: "text-cyan-700 dark:text-cyan-300", widthClass: "w-3/4" },
    { label: "SOM", sublabel: "Serviceable Obtainable Market", size: som, color: "border-amber-500 bg-amber-50 dark:bg-amber-900/10", textColor: "text-amber-700 dark:text-amber-300", widthClass: "w-2/5" },
  ];

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Market Size</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Total → Serviceable → Obtainable market funnel.</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-5">
        {tiers.map(({ label, sublabel, size, color, textColor, widthClass }) => {
          if (!size) return null;
          return (
            <div key={label} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className={cn("text-base font-bold", textColor)}>{label}</span>
                  <span className="text-xs text-muted-foreground ml-2">{sublabel}</span>
                </div>
                <span className={cn("text-lg font-bold", textColor)}>{formatMarketValue(size)}</span>
              </div>
              <div className={cn("flex items-start", widthClass)}>
                <div className={cn("w-full h-3 rounded-full border-2", color)} />
              </div>
              {size.methodology && (
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Method: </span>{size.methodology}
                </p>
              )}
              {size.reasoning && (
                <p className="text-xs text-muted-foreground leading-relaxed">{size.reasoning}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TimingBanner({ timing }: { timing: TimingAssessment }) {
  const isRight = timing.is_right_time !== false;
  return (
    <section className={cn(
      "rounded-xl border p-5 flex gap-4",
      isRight
        ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
        : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10"
    )}>
      <div className="shrink-0 mt-0.5">
        {isRight
          ? <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
          : <Clock size={20} className="text-amber-600 dark:text-amber-400" />
        }
      </div>
      <div className="flex flex-col gap-1">
        <p className={cn("text-sm font-semibold", isRight ? "text-green-800 dark:text-green-200" : "text-amber-800 dark:text-amber-200")}>
          {isRight ? "The Timing is Right" : "Timing Needs Consideration"}
        </p>
        {timing.reasoning && (
          <p className="text-sm text-foreground leading-relaxed">{timing.reasoning}</p>
        )}
      </div>
    </section>
  );
}

function OpportunityScore({ score, attractiveness }: { score?: number | string; attractiveness?: string }) {
  const numScore = typeof score === "number" ? score : parseFloat(String(score ?? "0"));
  const pct = Math.min(Math.max((numScore / 10) * 100, 0), 100);
  const color = pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
  const textColor = pct >= 70 ? "text-green-600 dark:text-green-400" : pct >= 40 ? "text-amber-600 dark:text-amber-400" : "text-red-500";

  return (
    <section className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">Opportunity Score</h3>
      <div className="flex items-center gap-4">
        <div className={cn("text-4xl font-bold", textColor)}>{numScore}<span className="text-lg text-muted-foreground">/10</span></div>
        <div className="flex-1">
          <div className="h-2.5 rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
      {attractiveness && (
        <p className="text-sm text-foreground leading-relaxed">{attractiveness}</p>
      )}
    </section>
  );
}

function PestelGrid({ pestel }: { pestel: PestelAnalysis }) {
  const KEYS = ["political", "economic", "social", "technological", "environmental", "legal"];
  const COLORS = [
    "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10",
    "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10",
    "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10",
    "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10",
    "border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/10",
    "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10",
  ];
  const LABEL_COLORS = [
    "text-blue-700 dark:text-blue-300",
    "text-green-700 dark:text-green-300",
    "text-purple-700 dark:text-purple-300",
    "text-amber-700 dark:text-amber-300",
    "text-teal-700 dark:text-teal-300",
    "text-red-700 dark:text-red-300",
  ];

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">PESTEL Analysis</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {KEYS.map((key, i) => {
          const raw = pestel[key];
          if (!raw) return null;
          const { description, impact } = pestelFactorText(raw);
          return (
            <div key={key} className={cn("rounded-xl border p-4 flex flex-col gap-2", COLORS[i])}>
              <div className="flex items-center justify-between">
                <span className={cn("text-xs font-bold uppercase tracking-wider", LABEL_COLORS[i])}>
                  {key.charAt(0).toUpperCase()}{key.slice(1)}
                </span>
                {impact && (
                  <span className="text-[10px] text-muted-foreground capitalize">{impact}</span>
                )}
              </div>
              {description && (
                <p className="text-xs text-foreground leading-relaxed">{description}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MarketSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-pulse">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-5 w-36 rounded-full bg-neutral-200 dark:bg-neutral-700" />
      </div>
      {(["h-28", "h-40", "h-20", "h-52"] as const).map((h, i) => (
        <div key={i} className={cn("rounded-xl bg-neutral-200 dark:bg-neutral-700", h)} />
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function MarketPotentialSection({ data, isLoading, error }: SectionState) {
  if (isLoading) return <MarketSkeleton />;

  if (error) {
    return (
      <div className="flex items-start gap-3 text-red-500 p-5 rounded-xl border border-border bg-card">
        <AlertCircle size={18} className="shrink-0 mt-0.5" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl border-2 border-dashed border-border bg-card">
        <p className="text-sm text-muted-foreground text-center">Run the pipeline to generate market analysis.</p>
      </div>
    );
  }

  const structured = parseMarketData(data);
  if (!structured) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">{data}</pre>
        </div>
      </div>
    );
  }

  const {
    market_definition,
    tam,
    sam,
    som,
    timing_assessment,
    pestel_analysis,
    opportunity_score,
    opportunity_attractiveness,
    summary,
  } = structured;

  return (
    <div className="flex flex-col gap-10">
      {/* Summary */}
      {summary && (
        <section className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground mb-1">Market Summary</p>
          <p className="text-sm text-foreground leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Market Definition */}
      {market_definition && (
        <section className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Market Definition</h3>
          <p className="text-sm text-foreground leading-relaxed">{market_definition}</p>
        </section>
      )}

      {/* TAM / SAM / SOM Funnel */}
      {(tam || sam || som) && <MarketFunnel tam={tam} sam={sam} som={som} />}

      {/* Opportunity Score */}
      {(opportunity_score !== undefined && opportunity_score !== null) && (
        <OpportunityScore score={opportunity_score} attractiveness={opportunity_attractiveness} />
      )}

      {/* Why Now? */}
      {timing_assessment && <TimingBanner timing={timing_assessment} />}

      {/* PESTEL */}
      {pestel_analysis && Object.keys(pestel_analysis).length > 0 && (
        <PestelGrid pestel={pestel_analysis} />
      )}
    </div>
  );
}

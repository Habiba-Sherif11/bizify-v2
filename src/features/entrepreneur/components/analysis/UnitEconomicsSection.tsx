"use client";

import { DollarSign, AlertCircle, AlertTriangle, TrendingUp, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BreakEven {
  timeline_to_break_even?: unknown;
  buyers_needed_to_break_even?: unknown;
  monthly_revenue_at_break_even?: unknown;
  monthly_cost_at_break_even?: unknown;
  break_even_month?: unknown;
}

interface MonthlyProjection {
  month?: unknown;
  revenue?: unknown;
  costs?: unknown;
  profit?: unknown;
  customers?: unknown;
}

interface PaybackPeriodObject {
  months?: unknown;
  interpretation?: string;
  calculation?: string;
}

interface OverallViabilityObject {
  is_economically_viable?: boolean | string;
  confidence_level?: string;
  viability_reasoning?: string;
  red_flags?: unknown[];
}

interface UnitEconomicsData {
  break_even?: BreakEven;
  monthly_projections?: unknown[];
  ltv_cac_ratio?: unknown;
  ltv?: unknown;
  cac?: unknown;
  payback_period?: unknown;
  weak_assumptions?: unknown[];
  overall_viability?: string | OverallViabilityObject;
  summary?: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseUnitEconomicsData(raw: string): UnitEconomicsData | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as UnitEconomicsData;
  } catch { /* not JSON */ }
  return null;
}

/** Safely convert any backend value to a display string. */
function toStr(val: unknown): string {
  if (val === undefined || val === null) return "—";
  if (typeof val === "string") return val.trim() || "—";
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return JSON.stringify(val);
}

function fmt(val: unknown): string {
  if (val === undefined || val === null) return "—";
  if (typeof val === "number") {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000)     return `$${(val / 1_000).toFixed(1)}K`;
    return `$${val.toLocaleString()}`;
  }
  if (typeof val === "string") {
    const str = val.trim();
    if (/^\$|\d/.test(str)) return str || "—";
    return str || "—";
  }
  return toStr(val);
}

function profitColor(profit: unknown): string {
  const n = typeof profit === "number" ? profit : parseFloat(String(profit ?? "0").replace(/[^0-9.-]/g, ""));
  if (isNaN(n)) return "text-foreground";
  if (n > 0) return "text-green-600 dark:text-green-400";
  if (n < 0) return "text-red-500 dark:text-red-400";
  return "text-muted-foreground";
}

function formatPayback(val: unknown): string {
  if (val === undefined || val === null) return "—";
  if (typeof val === "string") return val;
  if (typeof val === "number") return `${val} months`;
  if (typeof val === "object" && val !== null) {
    const obj = val as PaybackPeriodObject;
    if (obj.interpretation) return String(obj.interpretation);
    if (obj.months !== undefined) return `${obj.months} months`;
    return JSON.stringify(val);
  }
  return String(val);
}

function ltvCacLabel(ratio: unknown): { label: string; color: string } {
  const n = typeof ratio === "number" ? ratio : parseFloat(String(ratio ?? "0"));
  if (isNaN(n)) return { label: "Unknown", color: "text-muted-foreground" };
  if (n >= 3)   return { label: "Healthy (≥3:1)", color: "text-green-600 dark:text-green-400" };
  if (n >= 1)   return { label: "Marginal (1–3:1)", color: "text-amber-600 dark:text-amber-400" };
  return { label: "Negative (<1:1)", color: "text-red-500 dark:text-red-400" };
}

function normalizeProjections(raw: unknown[]): MonthlyProjection[] {
  return raw.filter((r) => r && typeof r === "object").map((r) => r as MonthlyProjection);
}

function normalizeAssumptions(raw: unknown[]): string[] {
  return raw.map((a) => {
    if (typeof a === "string") return a;
    if (a && typeof a === "object") {
      const obj = a as Record<string, unknown>;
      return obj.assumption ?? obj.text ?? obj.description ?? JSON.stringify(a);
    }
    return String(a);
  }).filter(Boolean) as string[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BreakEvenHero({ breakEven }: { breakEven: BreakEven }) {
  const {
    timeline_to_break_even,
    buyers_needed_to_break_even,
    monthly_revenue_at_break_even,
    monthly_cost_at_break_even,
  } = breakEven;

  return (
    <section className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={16} className="text-amber-600 dark:text-amber-400" />
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Break-Even Point</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {timeline_to_break_even !== undefined && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Timeline</p>
            <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{toStr(timeline_to_break_even)}</p>
          </div>
        )}
        {buyers_needed_to_break_even !== undefined && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Buyers Needed</p>
            <p className="text-lg font-bold text-foreground">{toStr(buyers_needed_to_break_even)}</p>
          </div>
        )}
        {monthly_revenue_at_break_even !== undefined && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Monthly Revenue</p>
            <p className="text-lg font-bold text-foreground">{fmt(monthly_revenue_at_break_even)}</p>
          </div>
        )}
        {monthly_cost_at_break_even !== undefined && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Monthly Cost</p>
            <p className="text-lg font-bold text-foreground">{fmt(monthly_cost_at_break_even)}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function KeyMetrics({ ltv, cac, ratio, payback }: {
  ltv?: unknown;
  cac?: unknown;
  ratio?: unknown;
  payback?: unknown;
}) {
  const ratioParsed = typeof ratio === "number" ? ratio : parseFloat(String(ratio ?? "0"));
  const { label: ratioLabel, color: ratioColor } = ltvCacLabel(ratio);
  const hasMetrics = ltv !== undefined || cac !== undefined || ratio !== undefined || payback !== undefined;
  if (!hasMetrics) return null;

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">Key Metrics</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ltv !== undefined && (
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">LTV</p>
            <p className="text-xl font-bold text-foreground">{fmt(ltv)}</p>
            <p className="text-xs text-muted-foreground">Customer Lifetime Value</p>
          </div>
        )}
        {cac !== undefined && (
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">CAC</p>
            <p className="text-xl font-bold text-foreground">{fmt(cac)}</p>
            <p className="text-xs text-muted-foreground">Customer Acquisition Cost</p>
          </div>
        )}
        {ratio !== undefined && (
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">LTV:CAC</p>
            <p className={cn("text-xl font-bold", ratioColor)}>
              {isNaN(ratioParsed) ? toStr(ratio) : `${ratioParsed.toFixed(1)}:1`}
            </p>
            <p className={cn("text-xs", ratioColor)}>{ratioLabel}</p>
          </div>
        )}
        {payback !== undefined && (
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Payback Period</p>
            <p className="text-xl font-bold text-foreground">{formatPayback(payback)}</p>
            <p className="text-xs text-muted-foreground">Time to recover CAC</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectionsTable({ projections }: { projections: MonthlyProjection[] }) {
  if (projections.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Monthly Projections</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Revenue, costs, and profit trajectory.</p>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-neutral-50 dark:bg-neutral-800/50">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Month</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Customers</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Revenue</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Costs</th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Profit</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((row, i) => (
                <tr key={i} className={cn("border-t border-border", i % 2 === 1 && "bg-neutral-50/50 dark:bg-neutral-800/20")}>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {typeof row.month === "number" ? `Month ${row.month}` : toStr(row.month) !== "—" ? toStr(row.month) : `${i + 1}`}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{toStr(row.customers)}</td>
                  <td className="px-4 py-3 text-right text-foreground">{fmt(row.revenue)}</td>
                  <td className="px-4 py-3 text-right text-foreground">{fmt(row.costs)}</td>
                  <td className={cn("px-4 py-3 text-right font-semibold", profitColor(row.profit))}>
                    {fmt(row.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function WeakAssumptions({ assumptions }: { assumptions: string[] }) {
  if (assumptions.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <AlertTriangle size={15} className="text-amber-500" />
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Weak Assumptions to Validate</h3>
      </div>
      <div className="flex flex-col gap-2">
        {assumptions.map((assumption, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 px-4 py-3">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-sm text-foreground leading-relaxed">{assumption}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function OverallViabilityCard({ viability }: { viability: string | OverallViabilityObject }) {
  if (typeof viability === "string") {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-foreground leading-relaxed">{viability}</p>
      </div>
    );
  }

  const { is_economically_viable, confidence_level, viability_reasoning, red_flags } = viability;
  const isViable = is_economically_viable === true || String(is_economically_viable).toLowerCase() === "true";
  const isNotViable = is_economically_viable === false || String(is_economically_viable).toLowerCase() === "false";

  const confidenceColors: Record<string, string> = {
    high:   "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    low:    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };
  const confidenceKey = (confidence_level ?? "").toLowerCase();
  const confidenceCls = confidenceColors[confidenceKey] ?? "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";

  const normalizedFlags = Array.isArray(red_flags)
    ? red_flags.map((f) => (typeof f === "string" ? f : toStr(f))).filter((f) => f && f !== "—")
    : [];

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        {is_economically_viable !== undefined && (
          <div className="flex items-center gap-1.5">
            {isViable && <CheckCircle2 size={18} className="text-green-500" />}
            {isNotViable && <XCircle size={18} className="text-red-500" />}
            <span className={cn("text-sm font-semibold", isViable ? "text-green-600 dark:text-green-400" : isNotViable ? "text-red-500 dark:text-red-400" : "text-foreground")}>
              {isViable ? "Economically Viable" : isNotViable ? "Not Economically Viable" : toStr(is_economically_viable)}
            </span>
          </div>
        )}
        {confidence_level && (
          <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold", confidenceCls)}>
            {confidence_level} confidence
          </span>
        )}
      </div>

      {viability_reasoning && (
        <p className="text-sm text-foreground leading-relaxed">{viability_reasoning}</p>
      )}

      {normalizedFlags.length > 0 && (
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-red-500" />
            <p className="text-xs font-semibold uppercase tracking-wider text-red-500">Red Flags</p>
          </div>
          <ul className="flex flex-col gap-1.5">
            {normalizedFlags.map((flag, i) => (
              <li key={i} className="text-sm text-foreground leading-relaxed flex items-start gap-2">
                <span className="text-red-400 mt-0.5 shrink-0">•</span>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function UnitEconomicsSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-pulse">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-5 w-36 rounded-full bg-neutral-200 dark:bg-neutral-700" />
      </div>
      {(["h-28", "h-24", "h-60", "h-40"] as const).map((h, i) => (
        <div key={i} className={cn("rounded-xl bg-neutral-200 dark:bg-neutral-700", h)} />
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function UnitEconomicsSection({ data, isLoading, error }: SectionState) {
  if (isLoading) return <UnitEconomicsSkeleton />;

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
        <p className="text-sm text-muted-foreground text-center">Run the pipeline to generate financial analysis.</p>
      </div>
    );
  }

  const structured = parseUnitEconomicsData(data);
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
    break_even,
    monthly_projections,
    ltv_cac_ratio,
    ltv,
    cac,
    payback_period,
    weak_assumptions,
    overall_viability,
    summary,
  } = structured;

  const projections = Array.isArray(monthly_projections) ? normalizeProjections(monthly_projections) : [];
  const assumptions = Array.isArray(weak_assumptions) ? normalizeAssumptions(weak_assumptions) : [];
  const summaryStr = summary !== undefined ? (typeof summary === "string" ? summary : toStr(summary)) : null;

  return (
    <div className="flex flex-col gap-10">
      {/* Summary */}
      {summaryStr && summaryStr !== "—" && (
        <section className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground mb-1">Financial Summary</p>
          <p className="text-sm text-foreground leading-relaxed">{summaryStr}</p>
        </section>
      )}

      {/* Break-Even Hero */}
      {break_even && typeof break_even === "object" && <BreakEvenHero breakEven={break_even} />}

      {/* Key Metrics */}
      <KeyMetrics ltv={ltv} cac={cac} ratio={ltv_cac_ratio} payback={payback_period} />

      {/* Monthly Projections Table */}
      {projections.length > 0 && <ProjectionsTable projections={projections} />}

      {/* Overall Viability */}
      {overall_viability && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-foreground" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Overall Viability</h3>
          </div>
          <OverallViabilityCard viability={overall_viability} />
        </section>
      )}

      {/* Weak Assumptions */}
      <WeakAssumptions assumptions={assumptions} />
    </div>
  );
}

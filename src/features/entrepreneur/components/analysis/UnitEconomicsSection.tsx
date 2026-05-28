"use client";

import { useMemo } from "react";
import {
  Area, Bar, BarChart, CartesianGrid, Cell, Line, ComposedChart,
  PolarAngleAxis, RadialBar, RadialBarChart, ReferenceLine, XAxis, YAxis,
} from "recharts";
import {
  AlertCircle, AlertTriangle, TrendingUp, Calendar, CheckCircle2, XCircle,
  DollarSign, Target, Clock,
} from "lucide-react";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
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

interface NormalizedRow {
  monthLabel: string;
  monthIndex: number;
  revenue: number;
  costs: number;
  profit: number;
  customers: number;
}

// ─── Parsing / formatting helpers ─────────────────────────────────────────────

function parseUnitEconomicsData(raw: string): UnitEconomicsData | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as UnitEconomicsData;
  } catch { /* not JSON */ }
  return null;
}

function toNum(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string") {
    const s = val.trim().replace(/[$,\s]/g, "");
    const suffix = s.slice(-1).toUpperCase();
    const num = parseFloat(s);
    if (isNaN(num)) return null;
    if (suffix === "K") return num * 1_000;
    if (suffix === "M") return num * 1_000_000;
    if (suffix === "B") return num * 1_000_000_000;
    return num;
  }
  return null;
}

function toStr(val: unknown): string {
  if (val === undefined || val === null) return "—";
  if (typeof val === "string") return val.trim() || "—";
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return JSON.stringify(val);
}

function fmtMoney(val: unknown): string {
  const n = toNum(val);
  if (n === null) {
    if (typeof val === "string" && val.trim()) return val.trim();
    return "—";
  }
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000)     return `${sign}$${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`;
  return `${sign}$${Math.round(abs).toLocaleString()}`;
}

function fmtCount(val: unknown): string {
  const n = toNum(val);
  if (n === null) return toStr(val);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return Math.round(n).toLocaleString();
}

function formatPayback(val: unknown): string {
  if (val === undefined || val === null) return "—";
  if (typeof val === "string") return val;
  if (typeof val === "number") return `${val} mo`;
  if (typeof val === "object" && val !== null) {
    const obj = val as PaybackPeriodObject;
    if (obj.months !== undefined) return `${obj.months} mo`;
    if (obj.interpretation) return String(obj.interpretation);
    return "—";
  }
  return String(val);
}

function paybackTooltip(val: unknown): string | null {
  if (typeof val === "object" && val !== null) {
    const obj = val as PaybackPeriodObject;
    return obj.interpretation ?? obj.calculation ?? null;
  }
  return null;
}

function ltvCacBadge(ratio: number | null): { label: string; cls: string; zone: "bad" | "ok" | "good" | "unknown" } {
  if (ratio === null || isNaN(ratio)) return { label: "Unknown", cls: "text-muted-foreground", zone: "unknown" };
  if (ratio >= 3) return { label: "Healthy ≥3:1",   cls: "text-green-600 dark:text-green-400", zone: "good" };
  if (ratio >= 1) return { label: "Marginal 1–3:1", cls: "text-amber-600 dark:text-amber-400", zone: "ok" };
  return                   { label: "Negative <1:1", cls: "text-red-500 dark:text-red-400",     zone: "bad" };
}

function normalizeProjections(raw: unknown[]): NormalizedRow[] {
  const rows = raw
    .filter((r) => r && typeof r === "object")
    .map((r, i) => {
      const o = r as MonthlyProjection;
      const monthNum = toNum(o.month);
      const label =
        typeof o.month === "string" && o.month.trim() ? o.month.trim() :
        monthNum !== null ? `M${monthNum}` :
        `M${i + 1}`;
      return {
        monthLabel: label,
        monthIndex: monthNum ?? i + 1,
        revenue:   toNum(o.revenue)   ?? 0,
        costs:     toNum(o.costs)     ?? 0,
        profit:    toNum(o.profit)    ?? 0,
        customers: toNum(o.customers) ?? 0,
      };
    });
  return rows.sort((a, b) => a.monthIndex - b.monthIndex);
}

function normalizeAssumptions(raw: unknown[]): string[] {
  return raw
    .map((a) => {
      if (typeof a === "string") return a;
      if (a && typeof a === "object") {
        const obj = a as Record<string, unknown>;
        return String(obj.assumption ?? obj.text ?? obj.description ?? JSON.stringify(a));
      }
      return String(a);
    })
    .filter(Boolean);
}

function compactMoneyTick(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${Math.round(abs)}`;
}

// ─── Charts ───────────────────────────────────────────────────────────────────

const projectionConfig = {
  revenue: { label: "Revenue", color: "#10b981" }, // emerald
  costs:   { label: "Costs",   color: "#ef4444" }, // red
  profit:  { label: "Profit",  color: "#3b82f6" }, // blue
} satisfies ChartConfig;

function RevenueVsCostsChart({
  rows,
  breakEvenMonth,
}: {
  rows: NormalizedRow[];
  breakEvenMonth: number | null;
}) {
  const beLabel = breakEvenMonth !== null
    ? rows.find((r) => r.monthIndex === breakEvenMonth)?.monthLabel ?? null
    : null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <div>
        <h4 className="text-sm font-semibold text-foreground">Revenue, Costs & Profit Trajectory</h4>
        <p className="text-xs text-muted-foreground mt-0.5">Monthly projection across the forecast horizon.</p>
      </div>

      <ChartContainer config={projectionConfig} className="aspect-auto h-[280px] w-full">
        <ComposedChart data={rows} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"   stopColor="var(--color-revenue)" stopOpacity={0.35} />
              <stop offset="95%"  stopColor="var(--color-revenue)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fillCosts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"   stopColor="var(--color-costs)"   stopOpacity={0.22} />
              <stop offset="95%"  stopColor="var(--color-costs)"   stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="monthLabel" tickLine={false} axisLine={false} tickMargin={8} minTickGap={20} />
          <YAxis tickLine={false} axisLine={false} tickMargin={6} width={56} tickFormatter={compactMoneyTick} />

          <ChartTooltip
            content={<ChartTooltipContent indicator="line" labelFormatter={(label) => `Month ${label}`} formatter={(value) => fmtMoney(value)} />}
            cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
          />
          <ChartLegend content={<ChartLegendContent />} />

          <Area  dataKey="revenue" type="monotone" stroke="var(--color-revenue)" strokeWidth={2.25} fill="url(#fillRevenue)" />
          <Area  dataKey="costs"   type="monotone" stroke="var(--color-costs)"   strokeWidth={2.25} fill="url(#fillCosts)" />
          <Line  dataKey="profit"  type="monotone" stroke="var(--color-profit)"  strokeWidth={2} strokeDasharray="5 4" dot={false} />

          {beLabel && (
            <ReferenceLine
              x={beLabel}
              stroke="#f59e0b"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{ value: "Break-even", position: "top", fill: "#f59e0b", fontSize: 10, fontWeight: 600 }}
            />
          )}
        </ComposedChart>
      </ChartContainer>
    </div>
  );
}

const customerConfig = {
  customers: { label: "Customers", color: "#06b6d4" }, // cyan
} satisfies ChartConfig;

function CustomerGrowthChart({ rows }: { rows: NormalizedRow[] }) {
  const maxC = Math.max(...rows.map((r) => r.customers), 0);
  if (maxC === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Customer Growth</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Customers per month.</p>
        </div>
        <div className="text-xs text-muted-foreground">
          Peak <span className="font-semibold text-foreground tabular-nums">{fmtCount(maxC)}</span>
        </div>
      </div>

      <ChartContainer config={customerConfig} className="aspect-auto h-[200px] w-full">
        <BarChart data={rows} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="monthLabel" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
          <YAxis tickLine={false} axisLine={false} tickMargin={6} width={48} tickFormatter={fmtCount} />
          <ChartTooltip
            content={<ChartTooltipContent indicator="dot" labelFormatter={(label) => `Month ${label}`} formatter={(value) => fmtCount(value)} />}
            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
          />
          <Bar dataKey="customers" fill="var(--color-customers)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

const ltvCacConfig = {
  value: { label: "Amount" },
  ltv:   { label: "LTV", color: "#10b981" }, // emerald
  cac:   { label: "CAC", color: "#f43f5e" }, // rose
} satisfies ChartConfig;

function LtvCacComparison({ ltv, cac, ratio }: { ltv: number | null; cac: number | null; ratio: number | null }) {
  if (ltv === null && cac === null) return null;
  const badge = ltvCacBadge(ratio);
  const data = [
    { name: "LTV", key: "ltv", value: ltv ?? 0, fill: "var(--color-ltv)" },
    { name: "CAC", key: "cac", value: cac ?? 0, fill: "var(--color-cac)" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="text-sm font-semibold text-foreground">LTV vs CAC</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Customer value relative to acquisition cost.</p>
        </div>
        {ratio !== null && (
          <div className="flex items-baseline gap-2">
            <span className={cn("text-2xl font-bold tabular-nums", badge.cls)}>{ratio.toFixed(1)}:1</span>
            <span className={cn("text-xs font-semibold", badge.cls)}>{badge.label}</span>
          </div>
        )}
      </div>

      <ChartContainer config={ltvCacConfig} className="aspect-auto h-[140px] w-full">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" hide tickFormatter={compactMoneyTick} />
          <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={6} width={42} />
          <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(value, _name, item) => `${item.payload.name}: ${fmtMoney(value)}`} />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
            {data.map((d) => <Cell key={d.key} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ChartContainer>

      <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1 border-t border-border/60">
        <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">&lt;1 unsustainable</span>
        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">1–3 marginal</span>
        <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">≥3 healthy</span>
      </div>
    </div>
  );
}

const gaugeConfig = {
  ratio: { label: "LTV:CAC" },
} satisfies ChartConfig;

function LtvCacGauge({ ratio }: { ratio: number | null }) {
  if (ratio === null || isNaN(ratio)) return null;
  const badge = ltvCacBadge(ratio);
  const clamped = Math.max(0, Math.min(ratio, 6));
  const fill =
    badge.zone === "good" ? "#10b981" :
    badge.zone === "ok"   ? "#f59e0b" :
    "#ef4444";
  const data = [{ name: "ratio", value: clamped, fill }];

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-2">
      <h4 className="text-sm font-semibold text-foreground">LTV:CAC Health</h4>

      <ChartContainer config={gaugeConfig} className="aspect-auto h-[180px] w-full">
        <RadialBarChart
          data={data}
          startAngle={210}
          endAngle={-30}
          innerRadius={70}
          outerRadius={92}
        >
          <PolarAngleAxis type="number" domain={[0, 6]} tick={false} />
          <RadialBar dataKey="value" background={{ fill: "var(--muted)" }} cornerRadius={8} />
          <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>
            {ratio.toFixed(1)}:1
          </text>
          <text x="50%" y="64%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground" style={{ fontSize: "10px" }}>
            of 6.0+
          </text>
        </RadialBarChart>
      </ChartContainer>

      <div className="flex items-center justify-center">
        <span className={cn("text-xs font-semibold", badge.cls)}>{badge.label}</span>
      </div>
    </div>
  );
}

// ─── Cards ────────────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  sublabel,
  accent,
  tooltip,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  sublabel?: string;
  accent?: string;
  tooltip?: string | null;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2" title={tooltip ?? undefined}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon size={14} className="text-muted-foreground" />
      </div>
      <p className={cn("text-xl font-bold tabular-nums leading-tight", accent ?? "text-foreground")}>{value}</p>
      {sublabel && <p className="text-[11px] text-muted-foreground leading-snug">{sublabel}</p>}
    </div>
  );
}

function BreakEvenHero({
  breakEven,
  beMonth,
}: {
  breakEven: BreakEven;
  beMonth: number | null;
}) {
  const {
    timeline_to_break_even,
    buyers_needed_to_break_even,
    monthly_revenue_at_break_even,
    monthly_cost_at_break_even,
  } = breakEven;

  return (
    <section className="rounded-xl border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50/40 dark:from-amber-900/15 dark:to-yellow-900/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
          <Calendar size={14} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Break-Even Point</h3>
          <p className="text-[11px] text-muted-foreground">When revenue catches up to costs.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <BeStat label="Timeline" value={toStr(timeline_to_break_even)} highlight />
        <BeStat label="Buyers Needed" value={fmtCount(buyers_needed_to_break_even)} />
        <BeStat label="Monthly Revenue" value={fmtMoney(monthly_revenue_at_break_even)} />
        <BeStat label="Monthly Cost" value={fmtMoney(monthly_cost_at_break_even)} />
      </div>
      {beMonth !== null && (
        <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-3">
          Marked on the projection chart below at month {beMonth}.
        </p>
      )}
    </section>
  );
}

function BeStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn(
        "text-lg font-bold tabular-nums leading-tight",
        highlight ? "text-amber-700 dark:text-amber-300" : "text-foreground",
      )}>
        {value}
      </p>
    </div>
  );
}

function ProjectionsTable({ rows }: { rows: NormalizedRow[] }) {
  if (rows.length === 0) return null;
  return (
    <details className="rounded-xl border border-border bg-card overflow-hidden group">
      <summary className="px-5 py-3 cursor-pointer flex items-center justify-between text-sm font-medium text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
        <span>Full Monthly Breakdown</span>
        <span className="text-xs text-muted-foreground group-open:hidden">Show table</span>
        <span className="text-xs text-muted-foreground hidden group-open:inline">Hide table</span>
      </summary>
      <div className="overflow-x-auto border-t border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-800/50">
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Month</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Customers</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Revenue</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Costs</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Profit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const profitCls =
                row.profit > 0 ? "text-green-600 dark:text-green-400" :
                row.profit < 0 ? "text-red-500 dark:text-red-400" :
                "text-muted-foreground";
              return (
                <tr key={i} className={cn("border-t border-border", i % 2 === 1 && "bg-neutral-50/40 dark:bg-neutral-800/20")}>
                  <td className="px-4 py-2.5 font-medium text-foreground">{row.monthLabel}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">{fmtCount(row.customers)}</td>
                  <td className="px-4 py-2.5 text-right text-foreground tabular-nums">{fmtMoney(row.revenue)}</td>
                  <td className="px-4 py-2.5 text-right text-foreground tabular-nums">{fmtMoney(row.costs)}</td>
                  <td className={cn("px-4 py-2.5 text-right font-semibold tabular-nums", profitCls)}>
                    {fmtMoney(row.profit)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function WeakAssumptions({ assumptions }: { assumptions: string[] }) {
  if (assumptions.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <AlertTriangle size={15} className="text-amber-500" />
        <h3 className="text-base font-semibold text-foreground">Weak Assumptions to Validate</h3>
      </div>
      <div className="flex flex-col gap-2">
        {assumptions.map((assumption, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-900/10 px-4 py-3">
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
    <div className={cn(
      "rounded-xl border p-5 flex flex-col gap-4",
      isViable    ? "border-green-200 dark:border-green-800 bg-green-50/40 dark:bg-green-900/10" :
      isNotViable ? "border-red-200 dark:border-red-800 bg-red-50/40 dark:bg-red-900/10" :
      "border-border bg-card",
    )}>
      <div className="flex items-center gap-3 flex-wrap">
        {is_economically_viable !== undefined && (
          <div className="flex items-center gap-1.5">
            {isViable && <CheckCircle2 size={18} className="text-green-500" />}
            {isNotViable && <XCircle size={18} className="text-red-500" />}
            <span className={cn(
              "text-sm font-semibold",
              isViable ? "text-green-600 dark:text-green-400" :
              isNotViable ? "text-red-500 dark:text-red-400" :
              "text-foreground",
            )}>
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
        <div className="flex flex-col gap-2 pt-1 border-t border-border/60">
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
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-24 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-neutral-200 dark:bg-neutral-800" />)}
      </div>
      <div className="h-72 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-48 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function UnitEconomicsSection({ data, isLoading, error }: SectionState) {
  const structured = useMemo(() => (data ? parseUnitEconomicsData(data) : null), [data]);

  const projections = useMemo(
    () => (structured?.monthly_projections && Array.isArray(structured.monthly_projections)
      ? normalizeProjections(structured.monthly_projections)
      : []),
    [structured],
  );

  const assumptions = useMemo(
    () => (structured?.weak_assumptions && Array.isArray(structured.weak_assumptions)
      ? normalizeAssumptions(structured.weak_assumptions)
      : []),
    [structured],
  );

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

  if (!structured) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">{data}</pre>
      </div>
    );
  }

  const {
    break_even,
    ltv_cac_ratio,
    ltv,
    cac,
    payback_period,
    overall_viability,
    summary,
  } = structured;

  const ltvNum   = toNum(ltv);
  const cacNum   = toNum(cac);
  const ratioNum = toNum(ltv_cac_ratio) ?? (ltvNum !== null && cacNum && cacNum > 0 ? ltvNum / cacNum : null);
  const beMonth  = toNum(break_even?.break_even_month);

  const summaryStr = summary !== undefined
    ? (typeof summary === "string" ? summary : toStr(summary))
    : null;

  return (
    <div className="flex flex-col gap-8">
      {/* Summary banner */}
      {summaryStr && summaryStr !== "—" && (
        <section className="rounded-xl border border-border bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-900/50 p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
              <DollarSign size={15} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Financial Summary</p>
              <p className="text-sm text-foreground leading-relaxed">{summaryStr}</p>
            </div>
          </div>
        </section>
      )}

      {/* Key Metrics — hero row */}
      {(ltvNum !== null || cacNum !== null || ratioNum !== null || payback_period !== undefined) && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {ltvNum !== null && (
            <MetricCard icon={DollarSign} label="LTV" value={fmtMoney(ltvNum)} sublabel="Customer Lifetime Value" />
          )}
          {cacNum !== null && (
            <MetricCard icon={Target} label="CAC" value={fmtMoney(cacNum)} sublabel="Customer Acquisition Cost" />
          )}
          {ratioNum !== null && (
            <MetricCard
              icon={TrendingUp}
              label="LTV : CAC"
              value={`${ratioNum.toFixed(1)}:1`}
              sublabel={ltvCacBadge(ratioNum).label}
              accent={ltvCacBadge(ratioNum).cls}
            />
          )}
          {payback_period !== undefined && (
            <MetricCard
              icon={Clock}
              label="Payback"
              value={formatPayback(payback_period)}
              sublabel="Time to recover CAC"
              tooltip={paybackTooltip(payback_period)}
            />
          )}
        </section>
      )}

      {/* Break-Even Hero */}
      {break_even && typeof break_even === "object" && (
        <BreakEvenHero breakEven={break_even} beMonth={beMonth} />
      )}

      {/* Revenue vs Costs chart */}
      {projections.length > 0 && (
        <RevenueVsCostsChart rows={projections} breakEvenMonth={beMonth} />
      )}

      {/* Side-by-side: LTV/CAC bars + Gauge */}
      {(ltvNum !== null || cacNum !== null) && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <LtvCacComparison ltv={ltvNum} cac={cacNum} ratio={ratioNum} />
          </div>
          {ratioNum !== null && (
            <LtvCacGauge ratio={ratioNum} />
          )}
        </section>
      )}

      {/* Customer growth chart */}
      {projections.length > 0 && (
        <CustomerGrowthChart rows={projections} />
      )}

      {/* Collapsible projections table */}
      {projections.length > 0 && <ProjectionsTable rows={projections} />}

      {/* Overall Viability */}
      {overall_viability && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-foreground" />
            <h3 className="text-base font-semibold text-foreground">Overall Viability</h3>
          </div>
          <OverallViabilityCard viability={overall_viability} />
        </section>
      )}

      {/* Weak Assumptions */}
      <WeakAssumptions assumptions={assumptions} />
    </div>
  );
}

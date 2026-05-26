"use client";

import { Briefcase, AlertCircle, CheckCircle2, XCircle, AlertTriangle, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RevenueStream {
  name?: string;
  stream?: string;
  type?: string;
  description?: string;
  pricing?: string;
  monthly_potential?: string | number;
}

interface PricingStrategy {
  model?: string;
  price_point?: string;
  rationale?: string;
  description?: string;
}

interface FounderFit {
  can_execute?: boolean;
  reasoning?: string;
  biggest_execution_risk?: string;
}

interface CanvasBlock {
  key_partners?: string[];
  key_activities?: string[];
  key_resources?: string[];
  value_propositions?: string[];
  customer_relationships?: string[];
  channels?: string[];
  customer_segments?: string[];
  cost_structure?: string[] | { items?: string[]; total_monthly?: string | number; [k: string]: unknown };
  revenue_streams?: string[];
  [key: string]: unknown;
}

interface BusinessModelData {
  business_model_type?: string;
  business_model_canvas?: CanvasBlock;
  revenue_streams?: RevenueStream[];
  pricing_strategy?: PricingStrategy | string;
  founder_fit_assessment?: FounderFit | boolean;
  cost_structure?: string[] | Record<string, unknown>;
  summary?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseBusinessModelData(raw: string): BusinessModelData | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as BusinessModelData;
  } catch { /* not JSON */ }
  return null;
}

function getPricingInfo(ps: PricingStrategy | string | undefined): { model: string; price: string; rationale: string } {
  if (!ps) return { model: "", price: "", rationale: "" };
  if (typeof ps === "string") return { model: "", price: "", rationale: ps };
  return {
    model: ps.model ?? "",
    price: ps.price_point ?? "",
    rationale: ps.rationale ?? ps.description ?? "",
  };
}

function getFounderFit(ff: FounderFit | boolean | undefined): FounderFit | null {
  if (ff === undefined || ff === null) return null;
  if (typeof ff === "boolean") return { can_execute: ff };
  return ff;
}

function toStringArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === "string");
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items.filter((v): v is string => typeof v === "string");
  }
  return [];
}

// ─── Canvas Block Definitions ─────────────────────────────────────────────────

const CANVAS_BLOCKS: { key: keyof CanvasBlock; label: string; color: string }[] = [
  { key: "key_partners",          label: "Key Partners",          color: "border-purple-300 dark:border-purple-700 bg-purple-50/60 dark:bg-purple-900/10" },
  { key: "key_activities",        label: "Key Activities",        color: "border-blue-300 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-900/10" },
  { key: "value_propositions",    label: "Value Proposition",     color: "border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-900/10" },
  { key: "customer_relationships",label: "Customer Relationships",color: "border-green-300 dark:border-green-700 bg-green-50/60 dark:bg-green-900/10" },
  { key: "customer_segments",     label: "Customer Segments",     color: "border-cyan-300 dark:border-cyan-700 bg-cyan-50/60 dark:bg-cyan-900/10" },
  { key: "key_resources",         label: "Key Resources",         color: "border-indigo-300 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-900/10" },
  { key: "channels",              label: "Channels",              color: "border-teal-300 dark:border-teal-700 bg-teal-50/60 dark:bg-teal-900/10" },
  { key: "cost_structure",        label: "Cost Structure",        color: "border-red-300 dark:border-red-700 bg-red-50/60 dark:bg-red-900/10" },
  { key: "revenue_streams",       label: "Revenue Streams",       color: "border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-900/10" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
        <Briefcase size={16} />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Business Model</h2>
    </div>
  );
}

function CanvasBlockCard({ blockKey, label, color, canvas }: {
  blockKey: keyof CanvasBlock;
  label: string;
  color: string;
  canvas: CanvasBlock;
}) {
  const raw = canvas[blockKey];
  const items = toStringArray(raw);
  if (items.length === 0 && !raw) return null;

  const displayItems = items.length > 0 ? items : (typeof raw === "string" ? [raw] : []);

  return (
    <div className={cn("rounded-xl border p-4 flex flex-col gap-2", color)}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <ul className="flex flex-col gap-1.5">
        {displayItems.map((item, i) => (
          <li key={i} className="text-xs text-foreground flex items-start gap-1.5 leading-relaxed">
            <span className="w-1 h-1 rounded-full bg-current mt-1.5 shrink-0 opacity-50" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BusinessModelCanvas({ canvas }: { canvas: CanvasBlock }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Business Model Canvas</h3>
        <p className="text-sm text-muted-foreground mt-0.5">The nine building blocks of your business.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CANVAS_BLOCKS.map(({ key, label, color }) => (
          <CanvasBlockCard key={key} blockKey={key} label={label} color={color} canvas={canvas} />
        ))}
      </div>
    </section>
  );
}

function RevenueCard({ stream, index }: { stream: RevenueStream; index: number }) {
  const name = stream.name ?? stream.stream ?? `Stream ${index + 1}`;
  const colors = [
    "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10",
    "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10",
    "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10",
    "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10",
  ];

  return (
    <div className={cn("rounded-xl border p-4 flex flex-col gap-2", colors[index % colors.length])}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        {stream.type && (
          <span className="text-xs text-muted-foreground capitalize shrink-0">{stream.type}</span>
        )}
      </div>
      {stream.description && (
        <p className="text-xs text-muted-foreground leading-relaxed">{stream.description}</p>
      )}
      {stream.pricing && (
        <p className="text-xs text-foreground">
          <span className="font-medium text-muted-foreground">Pricing: </span>{stream.pricing}
        </p>
      )}
      {stream.monthly_potential !== undefined && (
        <p className="text-xs text-foreground">
          <span className="font-medium text-muted-foreground">Monthly potential: </span>{stream.monthly_potential}
        </p>
      )}
    </div>
  );
}

function FounderFitCard({ fit }: { fit: FounderFit }) {
  const canExecute = fit.can_execute !== false;
  return (
    <section className={cn(
      "rounded-xl border p-5 flex flex-col gap-3",
      canExecute
        ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10"
        : "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10"
    )}>
      <div className="flex items-center gap-2">
        {canExecute
          ? <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
          : <XCircle size={18} className="text-amber-600 dark:text-amber-400" />
        }
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Founder-Market Fit</h3>
        <span className={cn(
          "ml-auto text-xs font-semibold px-2 py-0.5 rounded-full",
          canExecute
            ? "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200"
            : "bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200"
        )}>
          {canExecute ? "Strong fit" : "Moderate fit"}
        </span>
      </div>

      {fit.reasoning && (
        <p className="text-sm text-foreground leading-relaxed">{fit.reasoning}</p>
      )}

      {fit.biggest_execution_risk && (
        <div className="flex items-start gap-2 mt-1 rounded-lg border border-amber-200 dark:border-amber-700 bg-white/60 dark:bg-neutral-900/40 px-4 py-3">
          <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-0.5">Biggest Execution Risk</p>
            <p className="text-xs text-foreground leading-relaxed">{fit.biggest_execution_risk}</p>
          </div>
        </div>
      )}
    </section>
  );
}

function BusinessModelSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-pulse">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-5 w-36 rounded-full bg-neutral-200 dark:bg-neutral-700" />
      </div>
      {(["h-20", "h-72", "h-40", "h-28"] as const).map((h, i) => (
        <div key={i} className={cn("rounded-xl bg-neutral-200 dark:bg-neutral-700", h)} />
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function BusinessModelSection({ data, isLoading, error }: SectionState) {
  if (isLoading) return <BusinessModelSkeleton />;

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
        <p className="text-sm text-muted-foreground text-center">Run the pipeline to generate business model analysis.</p>
      </div>
    );
  }

  const structured = parseBusinessModelData(data);
  if (!structured) {
    return (
      <div className="flex flex-col gap-4">
        <SectionHeader />
        <div className="rounded-xl border border-border bg-card p-5">
          <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">{data}</pre>
        </div>
      </div>
    );
  }

  const {
    business_model_type,
    business_model_canvas,
    revenue_streams = [],
    pricing_strategy,
    founder_fit_assessment,
    summary,
  } = structured;

  const pricing = getPricingInfo(pricing_strategy);
  const founderFit = getFounderFit(founder_fit_assessment);

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader />

      {/* Business Model Type */}
      {business_model_type && (
        <section className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Briefcase size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Business Model Type</p>
            <p className="text-base font-bold text-foreground">{business_model_type}</p>
          </div>
        </section>
      )}

      {/* Summary */}
      {summary && (
        <section className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground mb-1">Summary</p>
          <p className="text-sm text-foreground leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Business Model Canvas */}
      {business_model_canvas && <BusinessModelCanvas canvas={business_model_canvas} />}

      {/* Revenue Streams */}
      {revenue_streams.length > 0 && (
        <section className="flex flex-col gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Revenue Streams</h3>
            <p className="text-sm text-muted-foreground mt-0.5">How the business generates income.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {revenue_streams.map((s, i) => (
              <RevenueCard key={i} stream={s} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Pricing Strategy */}
      {(pricing.model || pricing.price || pricing.rationale) && (
        <section className="flex flex-col gap-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Pricing Strategy</h3>
          <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
            <div className="flex flex-wrap gap-4">
              {pricing.model && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Model</p>
                  <p className="text-sm font-semibold text-foreground">{pricing.model}</p>
                </div>
              )}
              {pricing.price && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Price Point</p>
                  <p className="text-sm font-semibold text-foreground">{pricing.price}</p>
                </div>
              )}
            </div>
            {pricing.rationale && (
              <p className="text-sm text-foreground leading-relaxed">{pricing.rationale}</p>
            )}
          </div>
        </section>
      )}

      {/* Founder Fit */}
      {founderFit && <FounderFitCard fit={founderFit} />}
    </div>
  );
}

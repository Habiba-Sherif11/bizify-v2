"use client";

import { Swords, AlertCircle, Target, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Competitor {
  name: string;
  website?: string;
  description?: string;
  strengths?: string[];
  weaknesses?: string[];
  market_share?: string;
  pricing?: string;
  target_segment?: string;
}

interface PositioningGap {
  gap?: string;
  opportunity?: string;
  description?: string;
}

interface PortersForce {
  level?: string;
  rating?: string;
  explanation?: string;
  reasoning?: string;
}

interface PortersFiveForces {
  threat_of_new_entrants?: PortersForce;
  bargaining_power_of_suppliers?: PortersForce;
  bargaining_power_of_buyers?: PortersForce;
  threat_of_substitutes?: PortersForce;
  competitive_rivalry?: PortersForce;
  [key: string]: PortersForce | undefined;
}

interface VrioItem {
  resource?: string;
  valuable?: boolean;
  rare?: boolean;
  inimitable?: boolean;
  organized?: boolean;
  competitive_implication?: string;
}

interface CompetitionData {
  summary?: string;
  direct_competitors?: Competitor[];
  indirect_alternatives?: Competitor[];
  positioning_gaps?: PositioningGap[];
  porters_five_forces?: PortersFiveForces;
  vrio_analysis?: VrioItem[];
  differentiation_opportunities?: string[];
  your_opening?: string;
  sources_list?: { url: string; title: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseCompetitionData(raw: string): CompetitionData | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as CompetitionData;
  } catch { /* not JSON */ }
  return null;
}

function forceLevel(force: PortersForce | undefined): string {
  return (force?.level ?? force?.rating ?? "").toLowerCase();
}

function forceLabel(key: string): string {
  const labels: Record<string, string> = {
    threat_of_new_entrants:        "New Entrants",
    bargaining_power_of_suppliers: "Supplier Power",
    bargaining_power_of_buyers:    "Buyer Power",
    threat_of_substitutes:         "Substitutes",
    competitive_rivalry:           "Competitive Rivalry",
  };
  return labels[key] ?? key.replace(/_/g, " ");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ForceLevelBadge({ level }: { level: string }) {
  const normalized = level.toLowerCase();
  if (normalized.includes("high"))
    return <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold">High</span>;
  if (normalized.includes("low"))
    return <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold">Low</span>;
  return <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold capitalize">{level || "Medium"}</span>;
}

function ForceLevelBar({ level }: { level: string }) {
  const normalized = level.toLowerCase();
  const isHigh   = normalized.includes("high");
  const isLow    = normalized.includes("low");
  const width    = isHigh ? "w-full" : isLow ? "w-1/4" : "w-1/2";
  const color    = isHigh ? "bg-red-500" : isLow ? "bg-green-500" : "bg-amber-500";
  return (
    <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 w-full">
      <div className={cn("h-full rounded-full transition-all", width, color)} />
    </div>
  );
}

function PortersSection({ forces }: { forces: PortersFiveForces }) {
  const FORCE_KEYS = [
    "threat_of_new_entrants",
    "bargaining_power_of_suppliers",
    "bargaining_power_of_buyers",
    "threat_of_substitutes",
    "competitive_rivalry",
  ];

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">Porter&apos;s Five Forces</h3>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {FORCE_KEYS.map((key, i) => {
          const force = forces[key];
          if (!force) return null;
          const level   = forceLevel(force);
          const explain = force.explanation ?? force.reasoning ?? "";
          return (
            <div
              key={key}
              className={cn("px-5 py-4 flex flex-col gap-2", i > 0 && "border-t border-border")}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-foreground">{forceLabel(key)}</span>
                <ForceLevelBadge level={level} />
              </div>
              <ForceLevelBar level={level} />
              {explain && <p className="text-xs text-muted-foreground leading-relaxed">{explain}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CompetitorCard({ competitor, index, type }: { competitor: Competitor; index: number; type: "direct" | "indirect" }) {
  const colors = [
    { bg: "bg-red-50 dark:bg-red-900/10", border: "border-red-200 dark:border-red-800", dot: "bg-red-500" },
    { bg: "bg-orange-50 dark:bg-orange-900/10", border: "border-orange-200 dark:border-orange-800", dot: "bg-orange-500" },
    { bg: "bg-purple-50 dark:bg-purple-900/10", border: "border-purple-200 dark:border-purple-800", dot: "bg-purple-500" },
    { bg: "bg-blue-50 dark:bg-blue-900/10", border: "border-blue-200 dark:border-blue-800", dot: "bg-blue-500" },
  ];
  const c = colors[index % colors.length];
  const indirectColors = [
    { bg: "bg-slate-50 dark:bg-slate-900/20", border: "border-slate-200 dark:border-slate-700", dot: "bg-slate-400" },
    { bg: "bg-neutral-50 dark:bg-neutral-800/40", border: "border-neutral-200 dark:border-neutral-700", dot: "bg-neutral-400" },
  ];
  const color = type === "indirect" ? indirectColors[index % indirectColors.length] : c;

  return (
    <div className={cn("rounded-xl border p-5 flex flex-col gap-3", color.bg, color.border)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full shrink-0 mt-1", color.dot)} />
          <span className="text-sm font-semibold text-foreground">{competitor.name}</span>
        </div>
        {competitor.website && (
          <a
            href={competitor.website.startsWith("http") ? competitor.website : `https://${competitor.website}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${competitor.name} website`}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <ExternalLink size={12} aria-hidden="true" />
          </a>
        )}
      </div>

      {competitor.description && (
        <p className="text-xs text-muted-foreground leading-relaxed">{competitor.description}</p>
      )}

      {competitor.target_segment && (
        <p className="text-xs text-foreground"><span className="font-medium text-muted-foreground">Targets: </span>{competitor.target_segment}</p>
      )}

      {competitor.pricing && (
        <p className="text-xs text-foreground"><span className="font-medium text-muted-foreground">Pricing: </span>{competitor.pricing}</p>
      )}

      <div className="grid grid-cols-2 gap-3 pt-1">
        {competitor.strengths && competitor.strengths.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-green-600 dark:text-green-400 mb-1.5">Strengths</p>
            <ul className="flex flex-col gap-1">
              {competitor.strengths.slice(0, 3).map((s, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {competitor.weaknesses && competitor.weaknesses.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-red-500 dark:text-red-400 mb-1.5">Weaknesses</p>
            <ul className="flex flex-col gap-1">
              {competitor.weaknesses.slice(0, 3).map((w, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function PositioningGapRow({ gap, index }: { gap: PositioningGap; index: number }) {
  const title = gap.gap ?? gap.opportunity ?? `Gap ${index + 1}`;
  const detail = gap.opportunity ?? gap.description ?? "";
  return (
    <div className="flex gap-4 px-5 py-4 items-start border-t border-border first:border-t-0">
      <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">
        {index + 1}
      </div>
      <div className="flex-1 flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {detail && title !== detail && <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>}
      </div>
    </div>
  );
}

function CompetitionSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-pulse">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-5 w-32 rounded-full bg-neutral-200 dark:bg-neutral-700" />
      </div>
      {(["h-36", "h-24", "h-48", "h-40"] as const).map((h, i) => (
        <div key={i} className={cn("rounded-xl bg-neutral-200 dark:bg-neutral-700", h)} />
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function CompetitionSection({ data, isLoading, error }: SectionState) {
  if (isLoading) return <CompetitionSkeleton />;

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
        <p className="text-sm text-muted-foreground text-center">Run the pipeline to generate competition analysis.</p>
      </div>
    );
  }

  const structured = parseCompetitionData(data);
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
    summary,
    direct_competitors = [],
    indirect_alternatives = [],
    positioning_gaps = [],
    your_opening,
    porters_five_forces,
    vrio_analysis = [],
    differentiation_opportunities = [],
  } = structured;

  return (
    <div className="flex flex-col gap-10">
      {/* Summary / Conclusion */}
      {summary && (
        <section className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground mb-1">Competitive Landscape Summary</p>
          <p className="text-sm text-foreground leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Your Opening */}
      {your_opening && (
        <section className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10 p-5 flex items-start gap-3">
          <Target size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Your Opening</p>
            <p className="text-sm text-foreground leading-relaxed">{your_opening}</p>
          </div>
        </section>
      )}

      {/* Direct Competitors */}
      {direct_competitors.length > 0 && (
        <section className="flex flex-col gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Direct Competitors</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Companies targeting the same problem and customer segment.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {direct_competitors.map((c, i) => (
              <CompetitorCard key={i} competitor={c} index={i} type="direct" />
            ))}
          </div>
        </section>
      )}

      {/* Indirect Alternatives */}
      {indirect_alternatives.length > 0 && (
        <section className="flex flex-col gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Indirect Alternatives</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Adjacent solutions customers might use instead.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {indirect_alternatives.map((c, i) => (
              <CompetitorCard key={i} competitor={c} index={i} type="indirect" />
            ))}
          </div>
        </section>
      )}

      {/* Porter&apos;s Five Forces */}
      {porters_five_forces && Object.keys(porters_five_forces).length > 0 && (
        <PortersSection forces={porters_five_forces} />
      )}

      {/* VRIO Analysis */}
      {vrio_analysis.length > 0 && (
        <section className="flex flex-col gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">VRIO Analysis</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Resources evaluated for Value, Rarity, Imitability, and Organization.</p>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50 dark:bg-neutral-800/50">
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Resource</th>
                    <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Valuable</th>
                    <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Rare</th>
                    <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Inimitable</th>
                    <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Organized</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Implication</th>
                  </tr>
                </thead>
                <tbody>
                  {vrio_analysis.map((item, i) => (
                    <tr key={i} className={cn("border-t border-border", i % 2 === 1 && "bg-neutral-50/50 dark:bg-neutral-800/20")}>
                      <td className="px-4 py-3 font-medium text-foreground">{item.resource ?? "—"}</td>
                      {(["valuable", "rare", "inimitable", "organized"] as const).map((k) => (
                        <td key={k} className="px-3 py-3 text-center">
                          {item[k] === true ? (
                            <span className="inline-block w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold leading-5">✓</span>
                          ) : item[k] === false ? (
                            <span className="inline-block w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold leading-5">✕</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-xs text-foreground leading-relaxed">{item.competitive_implication ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Positioning Gaps */}
      {positioning_gaps.length > 0 && (
        <section className="flex flex-col gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Market Positioning Gaps</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Where the market is underserved — your entry points.</p>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {positioning_gaps.map((gap, i) => (
              <PositioningGapRow key={i} gap={gap} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Differentiation Opportunities */}
      {differentiation_opportunities.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Your Differentiation Opportunities</h3>
          <div className="flex flex-col gap-2">
            {differentiation_opportunities.map((opp, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 px-4 py-3">
                <Target size={14} className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <p className="text-sm text-foreground leading-relaxed">{opp}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

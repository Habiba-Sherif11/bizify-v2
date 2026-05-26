"use client";

import {
  Megaphone,
  AlertCircle,
  Users,
  Radio,
  Rocket,
  Tag,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ICP {
  description?: string;
  demographics?: string[];
  pain_points?: string[];
  goals?: string[];
  psychographics?: string[];
  behaviors?: string[];
}

interface Channel {
  name?: string;
  type?: string;
  rationale?: string;
  tactics?: string[];
  priority?: "high" | "medium" | "low" | string;
  cost?: string;
  timeline?: string;
}

interface LaunchPhase {
  phase?: string | number;
  name?: string;
  duration?: string;
  goals?: string[];
  actions?: string[];
  milestones?: string[];
  key_activities?: string[];
}

interface PricingTier {
  name?: string;
  price?: string | number;
  description?: string;
  features?: string[];
}

interface PricingStrategy {
  model?: string;
  rationale?: string;
  price_point?: string;
  tiers?: PricingTier[];
}

interface Messaging {
  tagline?: string;
  key_messages?: string[];
  value_statement?: string;
  elevator_pitch?: string;
}

interface EarlyAdopters {
  profile?: string;
  acquisition_strategy?: string;
  channels?: string[];
  why?: string;
}

type MetricItem = string | { name?: string; target?: string; kpi?: string; description?: string };

interface GoToMarketData {
  summary?: string;
  target_segment?: string;
  ideal_customer_profile?: ICP;
  positioning_statement?: string;
  value_proposition?: string;
  channels?: Channel[];
  distribution_channels?: Channel[];
  launch_phases?: LaunchPhase[];
  phases?: LaunchPhase[];
  pricing_strategy?: PricingStrategy;
  success_metrics?: MetricItem[];
  kpis?: MetricItem[];
  early_adopters?: EarlyAdopters;
  messaging?: Messaging;
  go_to_market_strategy?: string;
  [key: string]: unknown;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseGTMData(raw: string): GoToMarketData | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as GoToMarketData;
  } catch { /* not JSON */ }
  return null;
}

function priorityConfig(priority: string | undefined) {
  const p = (priority ?? "medium").toLowerCase();
  if (p === "high")
    return {
      badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-800",
      bg: "bg-amber-50/60 dark:bg-amber-900/10",
      dot: "bg-amber-500",
      label: "High",
    };
  if (p === "low")
    return {
      badge: "bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400",
      border: "border-neutral-200 dark:border-neutral-700",
      bg: "bg-neutral-50/60 dark:bg-neutral-800/30",
      dot: "bg-neutral-400",
      label: "Low",
    };
  return {
    badge: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-200 dark:border-cyan-800",
    bg: "bg-cyan-50/60 dark:bg-cyan-900/10",
    dot: "bg-cyan-500",
    label: "Medium",
  };
}

function metricLabel(m: MetricItem): string {
  if (typeof m === "string") return m;
  return m.name ?? m.kpi ?? m.description ?? "";
}

function metricTarget(m: MetricItem): string | undefined {
  if (typeof m === "string") return undefined;
  return m.target;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2">
        <span className="text-amber-500 dark:text-amber-400">{icon}</span>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function TagPill({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: "neutral" | "pain" | "goal" | "demo" | "amber";
}) {
  const cls = {
    neutral: "bg-neutral-100 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-600",
    pain: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    goal: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    demo: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  }[variant];

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", cls)}>
      {children}
    </span>
  );
}

function ICPCard({ icp }: { icp: ICP }) {
  const demographics = icp.demographics ?? [];
  const painPoints = icp.pain_points ?? [];
  const goals = icp.goals ?? [];
  const psychographics = icp.psychographics ?? [];
  const behaviors = icp.behaviors ?? [];

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader icon={<Users size={16} />} title="Ideal Customer Profile" subtitle="Who you're building this for." />
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {icp.description && (
          <div className="px-5 py-4 border-b border-border">
            <p className="text-sm text-foreground leading-relaxed">{icp.description}</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {painPoints.length > 0 && (
            <div className="px-5 py-4 flex flex-col gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-red-500 dark:text-red-400">Pain Points</p>
              <div className="flex flex-wrap gap-1.5">
                {painPoints.map((p, i) => <TagPill key={i} variant="pain">{p}</TagPill>)}
              </div>
            </div>
          )}
          {goals.length > 0 && (
            <div className="px-5 py-4 flex flex-col gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Goals</p>
              <div className="flex flex-wrap gap-1.5">
                {goals.map((g, i) => <TagPill key={i} variant="goal">{g}</TagPill>)}
              </div>
            </div>
          )}
        </div>
        {demographics.length > 0 && (
          <div className="px-5 py-4 border-t border-border flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Demographics</p>
            <div className="flex flex-wrap gap-1.5">
              {demographics.map((d, i) => <TagPill key={i} variant="demo">{d}</TagPill>)}
            </div>
          </div>
        )}
        {(psychographics.length > 0 || behaviors.length > 0) && (
          <div className="px-5 py-4 border-t border-border flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              {psychographics.length > 0 ? "Psychographics" : "Behaviors"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[...psychographics, ...behaviors].map((b, i) => (
                <TagPill key={i} variant="neutral">{b}</TagPill>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ChannelCard({ channel, index }: { channel: Channel; index: number }) {
  const cfg = priorityConfig(channel.priority);
  const tactics = channel.tactics ?? [];

  return (
    <div className={cn("rounded-xl border p-5 flex flex-col gap-3", cfg.bg, cfg.border)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full shrink-0 mt-0.5", cfg.dot)} />
          <span className="text-sm font-semibold text-foreground">{channel.name ?? `Channel ${index + 1}`}</span>
        </div>
        <span className={cn("shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border", cfg.badge, cfg.border)}>
          {cfg.label}
        </span>
      </div>

      {channel.type && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground/70">Type: </span>{channel.type}
        </p>
      )}

      {channel.rationale && (
        <p className="text-xs text-foreground/80 leading-relaxed">{channel.rationale}</p>
      )}

      {(channel.cost || channel.timeline) && (
        <div className="flex gap-3 text-xs text-muted-foreground">
          {channel.cost && <span><span className="font-medium">Cost:</span> {channel.cost}</span>}
          {channel.timeline && <span><span className="font-medium">Timeline:</span> {channel.timeline}</span>}
        </div>
      )}

      {tactics.length > 0 && (
        <div className="pt-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tactics</p>
          <ul className="flex flex-col gap-1">
            {tactics.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                <ChevronRight size={10} className="mt-1 shrink-0 text-muted-foreground" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function LaunchTimeline({ phases }: { phases: LaunchPhase[] }) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader icon={<Rocket size={16} />} title="Launch Phases" subtitle="Step-by-step roadmap to market." />
      <div className="flex flex-col gap-0">
        {phases.map((phase, i) => {
          const actions = phase.actions ?? phase.key_activities ?? [];
          const goals = phase.goals ?? phase.milestones ?? [];
          const isLast = i === phases.length - 1;

          return (
            <div key={i} className="flex gap-4">
              {/* Timeline spine */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-400 dark:border-amber-600 flex items-center justify-center text-[11px] font-bold text-amber-700 dark:text-amber-300 shrink-0 z-10">
                  {i + 1}
                </div>
                {!isLast && <div className="w-0.5 flex-1 bg-amber-200 dark:bg-amber-800/50 my-1" />}
              </div>

              {/* Phase content */}
              <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
                <div className="flex items-center gap-2 mb-2 pt-1.5">
                  <span className="text-sm font-semibold text-foreground">
                    {phase.name ?? `Phase ${i + 1}`}
                  </span>
                  {phase.duration && (
                    <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-[10px] text-muted-foreground border border-neutral-200 dark:border-neutral-600">
                      {phase.duration}
                    </span>
                  )}
                </div>

                {(goals.length > 0 || actions.length > 0) && (
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    {goals.length > 0 && (
                      <div className="px-4 py-3 flex flex-col gap-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Goals</p>
                        <ul className="flex flex-col gap-1">
                          {goals.map((g, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                              <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-emerald-500" />
                              {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {actions.length > 0 && (
                      <div className={cn("px-4 py-3 flex flex-col gap-2", goals.length > 0 && "border-t border-border")}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Actions</p>
                        <ul className="flex flex-col gap-1">
                          {actions.map((a, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                              <Zap size={10} className="mt-0.5 shrink-0 text-amber-500" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PricingCard({ pricing }: { pricing: PricingStrategy }) {
  const tiers = pricing.tiers ?? [];

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader icon={<Tag size={16} />} title="Pricing Strategy" />
      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 overflow-hidden">
        <div className="px-5 py-4 flex flex-col gap-2">
          {pricing.model && (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-700">
                {pricing.model}
              </span>
              {pricing.price_point && (
                <span className="text-sm font-semibold text-foreground">{pricing.price_point}</span>
              )}
            </div>
          )}
          {pricing.rationale && (
            <p className="text-sm text-foreground/80 leading-relaxed">{pricing.rationale}</p>
          )}
        </div>

        {tiers.length > 0 && (
          <div className="border-t border-amber-200 dark:border-amber-800">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-amber-200 dark:divide-amber-800">
              {tiers.map((tier, i) => (
                <div key={i} className="px-4 py-4 flex flex-col gap-1.5">
                  <p className="text-xs font-semibold text-foreground">{tier.name ?? `Tier ${i + 1}`}</p>
                  {tier.price !== undefined && (
                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{tier.price}</p>
                  )}
                  {tier.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{tier.description}</p>
                  )}
                  {tier.features && tier.features.length > 0 && (
                    <ul className="flex flex-col gap-0.5 mt-1">
                      {tier.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-foreground/70">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function MetricsSection({ metrics }: { metrics: MetricItem[] }) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader icon={<BarChart3 size={16} />} title="Success Metrics" subtitle="How you'll know it's working." />
      <div className="flex flex-wrap gap-2">
        {metrics.map((m, i) => {
          const label = metricLabel(m);
          const target = metricTarget(m);
          if (!label) return null;
          return (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span className="font-medium text-foreground">{label}</span>
              {target && (
                <span className="text-muted-foreground pl-1 border-l border-border">{target}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MessagingCard({ messaging }: { messaging: Messaging }) {
  const keyMessages = messaging.key_messages ?? [];

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader icon={<MessageSquare size={16} />} title="Messaging" subtitle="What you say and how you say it." />
      <div className="flex flex-col gap-3">
        {(messaging.tagline || messaging.elevator_pitch) && (
          <div className="rounded-xl border border-border bg-card px-5 py-4 flex flex-col gap-2">
            {messaging.tagline && (
              <p className="text-base font-semibold text-foreground">&ldquo;{messaging.tagline}&rdquo;</p>
            )}
            {messaging.value_statement && (
              <p className="text-sm text-muted-foreground leading-relaxed">{messaging.value_statement}</p>
            )}
            {messaging.elevator_pitch && (
              <p className="text-sm text-foreground/80 leading-relaxed">{messaging.elevator_pitch}</p>
            )}
          </div>
        )}
        {keyMessages.length > 0 && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <p className="px-5 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Key Messages
            </p>
            {keyMessages.map((msg, i) => (
              <div
                key={i}
                className={cn("px-5 py-3 flex items-start gap-3", i > 0 && "border-t border-border")}
              >
                <span className="mt-1 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground leading-relaxed">{msg}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EarlyAdoptersCard({ ea }: { ea: EarlyAdopters }) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader icon={<Zap size={16} />} title="Early Adopters" subtitle="Who will be first to believe in you." />
      <div className="rounded-xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50/40 dark:bg-cyan-900/10 p-5 flex flex-col gap-3">
        {ea.profile && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1">Profile</p>
            <p className="text-sm text-foreground leading-relaxed">{ea.profile}</p>
          </div>
        )}
        {ea.why && (
          <p className="text-xs text-muted-foreground leading-relaxed italic">{ea.why}</p>
        )}
        {ea.acquisition_strategy && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1">Acquisition Strategy</p>
            <p className="text-sm text-foreground leading-relaxed">{ea.acquisition_strategy}</p>
          </div>
        )}
        {ea.channels && ea.channels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {ea.channels.map((c, i) => (
              <TagPill key={i} variant="neutral">{c}</TagPill>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const KNOWN_KEYS = new Set([
  "summary", "target_segment", "ideal_customer_profile", "positioning_statement",
  "value_proposition", "channels", "distribution_channels", "launch_phases", "phases",
  "pricing_strategy", "success_metrics", "kpis", "early_adopters", "messaging",
  "go_to_market_strategy",
]);

function toLabel(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function ExtraField({ label, value }: { label: string; value: unknown }) {
  const renderValue = (v: unknown): React.ReactNode => {
    if (v === null || v === undefined) return null;
    if (typeof v === "string") return <p className="text-sm text-foreground/80 leading-relaxed">{v}</p>;
    if (typeof v === "number" || typeof v === "boolean") return <p className="text-sm text-foreground/80">{String(v)}</p>;
    if (Array.isArray(v)) {
      if (v.length === 0) return null;
      if (v.every((item) => typeof item === "string")) {
        return (
          <div className="flex flex-wrap gap-1.5">
            {(v as string[]).map((item, i) => <TagPill key={i}>{item}</TagPill>)}
          </div>
        );
      }
      return (
        <ul className="flex flex-col gap-1">
          {v.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
              <ChevronRight size={10} className="mt-1 shrink-0 text-muted-foreground" />
              {typeof item === "string" ? item : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      );
    }
    if (typeof v === "object") {
      return (
        <div className="flex flex-col gap-2 pl-2 border-l-2 border-border">
          {Object.entries(v as Record<string, unknown>)
            .filter(([, val]) => val !== null && val !== undefined && val !== "")
            .map(([k, val]) => (
              <div key={k}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{toLabel(k)}</p>
                {renderValue(val)}
              </div>
            ))}
        </div>
      );
    }
    return null;
  };

  const rendered = renderValue(value);
  if (!rendered) return null;
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader icon={<ChevronRight size={16} />} title={label} />
      <div className="rounded-xl border border-border bg-card p-5">{rendered}</div>
    </section>
  );
}

function GoToMarketSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-pulse">
      <div className="h-16 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
      <div className="flex flex-col gap-3">
        <div className="h-4 w-32 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-28 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-4 w-40 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-4 w-36 rounded-full bg-neutral-200 dark:bg-neutral-700" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function GoToMarketSection({ data, isLoading, error }: SectionState) {
  if (isLoading) return <GoToMarketSkeleton />;

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
        <p className="text-sm text-muted-foreground text-center">Run the pipeline to generate the go-to-market strategy.</p>
      </div>
    );
  }

  const structured = parseGTMData(data);

  if (!structured) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">{data}</pre>
      </div>
    );
  }

  const {
    summary,
    target_segment,
    ideal_customer_profile,
    positioning_statement,
    value_proposition,
    channels,
    distribution_channels,
    launch_phases,
    phases,
    pricing_strategy,
    success_metrics,
    kpis,
    early_adopters,
    messaging,
    go_to_market_strategy,
  } = structured;

  const allChannels = channels ?? distribution_channels ?? [];
  const allPhases = launch_phases ?? phases ?? [];
  const allMetrics = success_metrics ?? kpis ?? [];

  const extraFields = Object.entries(structured).filter(
    ([k, v]) => !KNOWN_KEYS.has(k) && v !== null && v !== undefined && v !== ""
  );

  return (
    <div className="flex flex-col gap-10">

      {/* Summary */}
      {(summary || go_to_market_strategy) && (
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone size={14} className="text-amber-500" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Strategy Summary</p>
          </div>
          {summary && <p className="text-sm text-foreground leading-relaxed">{summary}</p>}
          {go_to_market_strategy && !summary && (
            <p className="text-sm text-foreground leading-relaxed">{go_to_market_strategy}</p>
          )}
          {go_to_market_strategy && summary && (
            <p className="text-sm text-foreground/80 leading-relaxed mt-2">{go_to_market_strategy}</p>
          )}
        </section>
      )}

      {/* Positioning */}
      {(positioning_statement || value_proposition || target_segment) && (
        <section className="flex flex-col gap-3">
          <SectionHeader icon={<Radio size={16} />} title="Positioning" />
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {target_segment && (
              <div className="px-5 py-4 flex flex-col gap-1 border-b border-border">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Target Segment</p>
                <p className="text-sm text-foreground leading-relaxed">{target_segment}</p>
              </div>
            )}
            {value_proposition && (
              <div className="px-5 py-4 flex flex-col gap-1 border-b border-border last:border-b-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Value Proposition</p>
                <p className="text-sm text-foreground leading-relaxed">{value_proposition}</p>
              </div>
            )}
            {positioning_statement && (
              <div className="px-5 py-4 flex flex-col gap-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Positioning Statement</p>
                <p className="text-sm text-foreground leading-relaxed italic">&ldquo;{positioning_statement}&rdquo;</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ICP */}
      {ideal_customer_profile && <ICPCard icp={ideal_customer_profile} />}

      {/* Channels */}
      {allChannels.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeader
            icon={<Radio size={16} />}
            title="Distribution Channels"
            subtitle="How you'll reach your first customers."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allChannels.map((ch, i) => (
              <ChannelCard key={i} channel={ch} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Launch Phases */}
      {allPhases.length > 0 && <LaunchTimeline phases={allPhases} />}

      {/* Pricing */}
      {pricing_strategy && <PricingCard pricing={pricing_strategy} />}

      {/* Early Adopters */}
      {early_adopters && <EarlyAdoptersCard ea={early_adopters} />}

      {/* Messaging */}
      {messaging && <MessagingCard messaging={messaging} />}

      {/* Success Metrics */}
      {allMetrics.length > 0 && <MetricsSection metrics={allMetrics} />}

      {/* Any extra fields from the backend not explicitly handled above */}
      {extraFields.map(([key, value]) => (
        <ExtraField key={key} label={toLabel(key)} value={value} />
      ))}

    </div>
  );
}

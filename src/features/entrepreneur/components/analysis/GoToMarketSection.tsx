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
  Target,
  Clock,
  DollarSign,
  Sparkles,
  TrendingUp,
  Compass,
  Flame,
  Star,
  Quote,
  MapPin,
  Eye,
  Search,
  ShoppingCart,
  Repeat,
  Share2,
  FlaskConical,
  CalendarDays,
  Calculator,
  RefreshCcw,
  Link2,
  Globe,
  Mail,
  Hash,
  CircleDollarSign,
  ChartLine,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

// Schema --------------------------------------------------------------------

interface TargetLaunchSegment {
  segment_name?: string;
  why_first?: string;
  size_estimate?: string;
  beachhead_cities?: string[];
}

interface PositioningMessage {
  headline?: string;
  subheadline?: string;
  proof_points?: string[];
  tone?: string;
  arabic_headline?: string;
}

interface MarketingChannel {
  channel?: string;
  role?: string;
  weekly_effort_hours?: number;
  monthly_cost_usd?: number;
  target_metric?: string;
  content_types?: string[];
  is_paid?: boolean;
}

interface FunnelStage {
  stage?: string;
  description?: string;
  channels?: string[];
  key_action?: string;
  conversion_target_pct?: number | null;
  metric?: string;
}

interface LaunchExperiment {
  id?: string;
  name?: string;
  hypothesis?: string;
  method?: string;
  success_metric?: string;
  timeline?: string;
  budget_usd?: number;
}

interface WeeklyBreakdownItem {
  week?: string;
  target_customers?: number;
  primary_action?: string;
}

interface First100Plan {
  target_timeline?: string;
  weekly_breakdown?: WeeklyBreakdownItem[];
  total_estimated_budget_usd?: number;
  key_actions?: string[];
}

interface LaunchTimelineWeek {
  week?: number;
  focus?: string;
  goal?: string;
}

interface CacByChannel {
  channel?: string;
  orders_from_channel?: string;
  spend_usd?: number;
  target_cac_usd?: number;
}

interface CacTracking {
  tracking_method?: string;
  by_channel?: CacByChannel[];
  weekly_review?: string;
  blended_cac_formula?: string;
}

interface FeedbackLoop {
  trigger?: string;
  method?: string;
  what_to_capture?: string;
  action?: string;
}

interface SourceItem {
  url?: string;
  title?: string;
}

interface GoToMarketData {
  summary?: string;
  go_to_market_strategy?: string;

  target_launch_segment?: TargetLaunchSegment;
  positioning_message?: PositioningMessage;
  marketing_channels?: MarketingChannel[];
  funnel_stages?: FunnelStage[];
  launch_experiments?: LaunchExperiment[];
  first_100_customers_plan?: First100Plan;
  launch_timeline?: LaunchTimelineWeek[];
  cac_tracking?: CacTracking;
  feedback_loops?: FeedbackLoop[];

  source_mode?: string;
  sources_used?: number;
  sources_list?: SourceItem[];

  [key: string]: unknown;
}

// Helpers -------------------------------------------------------------------

function parseGTMData(raw: string): GoToMarketData | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as GoToMarketData;
  } catch { /* not JSON */ }
  return null;
}

const DASH = "—";

function fmtUsd(n: number | undefined | null): string {
  if (n === undefined || n === null) return DASH;
  if (n === 0) return "Free";
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `$${n.toLocaleString()}`;
}

function fmtPct(n: number | null | undefined): string {
  if (n === null || n === undefined) return DASH;
  const v = n <= 1 ? n * 100 : n;
  return `${v.toFixed(v % 1 === 0 ? 0 : 1)}%`;
}

// Primitives ----------------------------------------------------------------

function SectionHeader({
  icon,
  title,
  subtitle,
  eyebrow,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  count?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      {eyebrow && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
          {eyebrow}
        </p>
      )}
      <div className="flex items-center gap-2">
        <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shrink-0">
          {icon}
        </span>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        {count !== undefined && (
          <span className="ml-auto text-[10px] font-mono text-muted-foreground tabular-nums">
            {String(count).padStart(2, "0")}
          </span>
        )}
      </div>
      {subtitle && <p className="text-sm text-muted-foreground pl-9">{subtitle}</p>}
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="relative flex flex-col gap-1 rounded-xl border border-border bg-card p-4 overflow-hidden">
      <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-amber-100/40 dark:bg-amber-900/10 blur-xl pointer-events-none" />
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground leading-tight">{hint}</p>}
    </div>
  );
}

function Pill({
  children,
  variant = "neutral",
  icon,
}: {
  children: React.ReactNode;
  variant?: "neutral" | "amber" | "emerald" | "blue" | "red" | "cyan" | "purple" | "slate";
  icon?: React.ReactNode;
}) {
  const cls = {
    neutral: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    red: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    cyan: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    slate: "bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  }[variant];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border", cls)}>
      {icon}
      {children}
    </span>
  );
}

// Hero ----------------------------------------------------------------------

function HeroOverview({
  summary,
  segment,
  totalBudget,
  timeline,
  channelCount,
  experimentCount,
  funnelStages,
}: {
  summary?: string;
  segment?: TargetLaunchSegment;
  totalBudget?: number;
  timeline?: string;
  channelCount: number;
  experimentCount: number;
  funnelStages: number;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="relative rounded-2xl border border-amber-200/70 dark:border-amber-800/50 bg-linear-to-br from-amber-50 via-orange-50/40 to-transparent dark:from-amber-950/30 dark:via-orange-950/15 dark:to-transparent p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-200/30 dark:bg-amber-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-200/20 dark:bg-orange-900/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700">
              <Megaphone size={11} className="text-amber-600 dark:text-amber-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Go-to-Market Strategy
              </span>
            </span>
            {segment?.segment_name && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 dark:bg-neutral-900/40 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-foreground/80">
                <Target size={10} className="text-amber-500" />
                {segment.segment_name}
              </span>
            )}
            {segment?.size_estimate && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 dark:bg-neutral-900/40 border border-amber-200/60 dark:border-amber-800/40 text-[11px] text-foreground/80">
                <Users size={10} className="text-amber-500" />
                {segment.size_estimate}
              </span>
            )}
          </div>

          {summary && (
            <p className="text-[15px] text-foreground leading-relaxed max-w-3xl">
              {summary}
            </p>
          )}
          {!summary && segment?.why_first && (
            <p className="text-[15px] text-foreground leading-relaxed max-w-3xl">
              {segment.why_first}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          icon={<Radio size={14} />}
          label="Channels"
          value={channelCount || DASH}
          hint={channelCount > 0 ? "Active marketing surfaces" : undefined}
        />
        <StatTile
          icon={<CircleDollarSign size={14} />}
          label="Launch Budget"
          value={fmtUsd(totalBudget)}
          hint={totalBudget ? "First 100 customers" : undefined}
        />
        <StatTile
          icon={<CalendarDays size={14} />}
          label="Timeline"
          value={timeline ?? DASH}
          hint={timeline ? "To hit 100 customers" : undefined}
        />
        <StatTile
          icon={<FlaskConical size={14} />}
          label="Experiments"
          value={experimentCount || funnelStages || DASH}
          hint={experimentCount > 0 ? `${experimentCount} experiments · ${funnelStages} funnel stages` : funnelStages > 0 ? `${funnelStages} funnel stages` : undefined}
        />
      </div>
    </section>
  );
}

// Target Launch Segment -----------------------------------------------------

function TargetSegmentCard({ segment }: { segment: TargetLaunchSegment }) {
  const cities = segment.beachhead_cities ?? [];

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        eyebrow="01 — Beachhead"
        icon={<Target size={14} />}
        title="Target Launch Segment"
        subtitle="Where you'll plant your flag first."
      />

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex gap-4 px-5 py-5 bg-linear-to-r from-amber-50/60 via-transparent to-transparent dark:from-amber-950/15">
          <div className="shrink-0">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-sm shadow-amber-200 dark:shadow-amber-900/30">
              <Target size={20} />
            </div>
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            {segment.segment_name && (
              <h4 className="text-lg font-semibold text-foreground leading-tight">{segment.segment_name}</h4>
            )}
            {segment.size_estimate && (
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                <Users size={11} className="inline mr-1 -mt-0.5" />
                {segment.size_estimate}
              </p>
            )}
          </div>
        </div>

        {segment.why_first && (
          <div className="px-5 py-4 border-t border-border flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Why First
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed">{segment.why_first}</p>
          </div>
        )}

        {cities.length > 0 && (
          <div className="px-5 py-4 border-t border-border flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Beachhead Cities
            </p>
            <div className="flex flex-wrap gap-1.5">
              {cities.map((c, i) => (
                <Pill key={i} variant="blue" icon={<MapPin size={10} />}>
                  {c}
                </Pill>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Positioning Message -------------------------------------------------------

function PositioningMessageCard({ msg }: { msg: PositioningMessage }) {
  const proofPoints = msg.proof_points ?? [];

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        eyebrow="02 — Voice"
        icon={<Megaphone size={14} />}
        title="Positioning Message"
        subtitle="The story you tell, in their words."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-linear-to-br from-amber-50/70 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10 p-6 flex flex-col gap-4">
          {msg.headline && (
            <div className="flex gap-3">
              <Quote size={18} className="shrink-0 mt-1 text-amber-400 dark:text-amber-500/80" />
              <h4 className="text-xl font-bold text-foreground leading-snug">{msg.headline}</h4>
            </div>
          )}
          {msg.subheadline && (
            <p className="text-sm text-foreground/75 leading-relaxed pl-7">{msg.subheadline}</p>
          )}
          {msg.arabic_headline && (
            <div className="mt-1 pl-7 pt-3 border-t border-amber-200/60 dark:border-amber-800/40 flex items-start gap-2" dir="rtl">
              <Globe size={14} className="shrink-0 mt-1 text-amber-500" />
              <p className="text-base text-foreground leading-relaxed font-medium" lang="ar">
                {msg.arabic_headline}
              </p>
            </div>
          )}
          {msg.tone && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tone:</span>
              <Pill variant="amber" icon={<Wand2 size={10} />}>{msg.tone}</Pill>
            </div>
          )}
        </div>

        {proofPoints.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Proof Points
              </p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {proofPoints.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/85 leading-relaxed">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

// Marketing Channels --------------------------------------------------------

function channelIcon(name?: string): React.ReactNode {
  const n = (name ?? "").toLowerCase();
  if (n.includes("social")) return <Share2 size={14} />;
  if (n.includes("influenc")) return <Sparkles size={14} />;
  if (n.includes("email")) return <Mail size={14} />;
  if (n.includes("search") || n.includes("seo")) return <Search size={14} />;
  if (n.includes("paid") || n.includes("ad")) return <Megaphone size={14} />;
  return <Radio size={14} />;
}

function MarketingChannelsSection({ channels }: { channels: MarketingChannel[] }) {
  const totalCost = channels.reduce((sum, c) => sum + (c.monthly_cost_usd ?? 0), 0);
  const totalHours = channels.reduce((sum, c) => sum + (c.weekly_effort_hours ?? 0), 0);
  const paidCount = channels.filter((c) => c.is_paid).length;

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        eyebrow="03 — Reach"
        icon={<Radio size={14} />}
        title="Marketing Channels"
        subtitle={`${channels.length} channels · ${paidCount} paid · ${fmtUsd(totalCost)}/mo · ${totalHours}h/wk`}
        count={channels.length}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {channels.map((ch, i) => {
          const contentTypes = ch.content_types ?? [];
          const isPaid = ch.is_paid === true;
          return (
            <div
              key={i}
              className={cn(
                "relative rounded-xl border p-5 flex flex-col gap-3 transition-all",
                isPaid
                  ? "border-amber-200 dark:border-amber-800/60 bg-linear-to-br from-amber-50/60 to-orange-50/20 dark:from-amber-950/15 dark:to-orange-950/5"
                  : "border-border bg-card"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn(
                    "inline-flex w-8 h-8 items-center justify-center rounded-lg shrink-0",
                    isPaid
                      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                  )}>
                    {channelIcon(ch.channel)}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {ch.channel ?? `Channel ${i + 1}`}
                    </span>
                    {ch.role && (
                      <span className="text-[11px] text-muted-foreground truncate">{ch.role}</span>
                    )}
                  </div>
                </div>
                <Pill variant={isPaid ? "amber" : "emerald"} icon={isPaid ? <CircleDollarSign size={10} /> : <Sparkles size={10} />}>
                  {isPaid ? "Paid" : "Organic"}
                </Pill>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border/60 bg-white/50 dark:bg-neutral-900/40 px-3 py-2 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <DollarSign size={10} />
                    Monthly Cost
                  </div>
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    {fmtUsd(ch.monthly_cost_usd)}
                  </span>
                </div>
                <div className="rounded-lg border border-border/60 bg-white/50 dark:bg-neutral-900/40 px-3 py-2 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Clock size={10} />
                    Effort
                  </div>
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    {ch.weekly_effort_hours ?? DASH}<span className="text-xs font-normal text-muted-foreground">h/wk</span>
                  </span>
                </div>
              </div>

              {ch.target_metric && (
                <div className="flex items-center gap-2 text-xs text-foreground/80">
                  <Target size={11} className="text-emerald-500 shrink-0" />
                  <span className="text-muted-foreground">Tracks:</span>
                  <span className="font-medium">{ch.target_metric}</span>
                </div>
              )}

              {contentTypes.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-1 border-t border-border/50">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Content Types
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {contentTypes.map((c, j) => (
                      <Pill key={j} variant="slate">{c}</Pill>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Funnel Stages -------------------------------------------------------------

function funnelIcon(stage?: string): React.ReactNode {
  const s = (stage ?? "").toLowerCase();
  if (s.includes("aware")) return <Eye size={14} />;
  if (s.includes("consider")) return <Search size={14} />;
  if (s.includes("conv")) return <ShoppingCart size={14} />;
  if (s.includes("reten")) return <Repeat size={14} />;
  if (s.includes("refer")) return <Share2 size={14} />;
  return <ChevronRight size={14} />;
}

function FunnelStagesSection({ stages }: { stages: FunnelStage[] }) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        eyebrow="04 — Journey"
        icon={<ChartLine size={14} />}
        title="Customer Funnel"
        subtitle="From first touch to advocacy."
        count={stages.length}
      />

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {stages.map((s, i) => {
          const isLast = i === stages.length - 1;
          const widthPct = Math.max(40, 100 - i * 12);
          const channels = s.channels ?? [];
          return (
            <div key={i} className={cn("relative", !isLast && "border-b border-border")}>
              <div
                className="absolute inset-y-0 left-0 bg-linear-to-r from-amber-100/50 via-amber-50/30 to-transparent dark:from-amber-900/15 dark:via-amber-950/10 pointer-events-none"
                style={{ width: `${widthPct}%` }}
              />

              <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-4 items-start px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-sm shadow-amber-200 dark:shadow-amber-900/40 shrink-0">
                    {funnelIcon(s.stage)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Stage {i + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-foreground">{s.stage ?? `Stage ${i + 1}`}</h4>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-0">
                  {s.description && (
                    <p className="text-sm text-foreground/85 leading-relaxed">{s.description}</p>
                  )}
                  {s.key_action && (
                    <div className="flex items-center gap-2 text-xs">
                      <Zap size={11} className="text-amber-500 shrink-0" />
                      <span className="text-muted-foreground">Key action:</span>
                      <span className="font-medium text-foreground">{s.key_action}</span>
                    </div>
                  )}
                  {channels.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {channels.map((c, j) => (
                        <Pill key={j} variant="slate" icon={<Radio size={9} />}>{c}</Pill>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col items-end gap-2 md:gap-1 shrink-0">
                  {s.conversion_target_pct !== null && s.conversion_target_pct !== undefined && (
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Target
                      </span>
                      <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 leading-none tabular-nums">
                        {fmtPct(s.conversion_target_pct)}
                      </span>
                    </div>
                  )}
                  {s.metric && (
                    <Pill variant="emerald" icon={<BarChart3 size={10} />}>{s.metric}</Pill>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// First 100 Customers Plan --------------------------------------------------

function First100Section({ plan }: { plan: First100Plan }) {
  const weeks = plan.weekly_breakdown ?? [];
  const actions = plan.key_actions ?? [];
  const total = weeks.reduce((sum, w) => sum + (w.target_customers ?? 0), 0);
  const maxCustomers = Math.max(...weeks.map((w) => w.target_customers ?? 0), 1);

  let running = 0;

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        eyebrow="05 — First 100"
        icon={<Users size={14} />}
        title="First 100 Customers Plan"
        subtitle="The plan to get from zero to traction."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatTile
          icon={<CalendarDays size={14} />}
          label="Timeline"
          value={plan.target_timeline ?? DASH}
          hint={total > 0 ? `${total} customers planned` : undefined}
        />
        <StatTile
          icon={<CircleDollarSign size={14} />}
          label="Total Budget"
          value={fmtUsd(plan.total_estimated_budget_usd)}
          hint="Estimated"
        />
        <StatTile
          icon={<Target size={14} />}
          label="Goal"
          value={total || 100}
          hint="Customers acquired"
        />
      </div>

      {weeks.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <ChartLine size={13} className="text-amber-500" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Weekly Acquisition Breakdown
            </p>
            <span className="ml-auto text-[10px] text-muted-foreground">cumulative →</span>
          </div>
          <div className="divide-y divide-border">
            {weeks.map((w, i) => {
              const customers = w.target_customers ?? 0;
              running += customers;
              const widthPct = (customers / maxCustomers) * 100;
              const cumPct = (running / (total || 100)) * 100;
              return (
                <div key={i} className="px-5 py-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                        W{w.week}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">+{customers} customers</span>
                        {w.primary_action && (
                          <span className="text-[11px] text-muted-foreground">{w.primary_action}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Cumulative</p>
                      <p className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">{running}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <div className="flex-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-amber-400 to-orange-500 transition-all"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground w-10 text-right tabular-nums">{cumPct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {actions.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <p className="px-5 pt-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Zap size={11} className="text-amber-500" />
            Key Actions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {[0, 1].map((col) => (
              <ul key={col} className="px-5 py-3 flex flex-col gap-2">
                {actions
                  .filter((_, i) => i % 2 === col)
                  .map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/85 leading-relaxed">
                      <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-500" />
                      {a}
                    </li>
                  ))}
              </ul>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// Launch Timeline -----------------------------------------------------------

function LaunchTimelineSection({ weeks }: { weeks: LaunchTimelineWeek[] }) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        eyebrow="06 — Roadmap"
        icon={<Rocket size={14} />}
        title="Launch Timeline"
        subtitle="Week-by-week focus and goals."
        count={weeks.length}
      />

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {weeks.map((w, i) => (
          <div
            key={i}
            className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-900/20"
          >
            <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 text-[10px] font-bold text-amber-700 dark:text-amber-300 flex items-center justify-center">
              {w.week}
            </span>
            <span className="text-xs font-medium text-foreground whitespace-nowrap">{w.focus}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {weeks.map((w, i) => (
          <div
            key={i}
            className="relative rounded-xl border border-border bg-card p-4 flex flex-col gap-2 overflow-hidden hover:border-amber-300 dark:hover:border-amber-700/60 transition-colors"
          >
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-amber-100/30 dark:bg-amber-900/10 blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2">
              <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 text-white text-[11px] font-bold shrink-0">
                {w.week}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Week {w.week}
              </span>
            </div>
            {w.focus && (
              <p className="text-sm font-semibold text-foreground leading-snug">{w.focus}</p>
            )}
            {w.goal && (
              <div className="flex items-center gap-1.5 pt-2 border-t border-border/50 mt-auto">
                <Target size={11} className="text-emerald-500 shrink-0" />
                <span className="text-xs text-foreground/80 font-medium">{w.goal}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// Launch Experiments --------------------------------------------------------

function ExperimentsSection({ experiments }: { experiments: LaunchExperiment[] }) {
  const totalBudget = experiments.reduce((s, e) => s + (e.budget_usd ?? 0), 0);

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        eyebrow="07 — Validate"
        icon={<FlaskConical size={14} />}
        title="Launch Experiments"
        subtitle={`Test before you scale · total budget ${fmtUsd(totalBudget)}`}
        count={experiments.length}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {experiments.map((e, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3 hover:border-amber-300 dark:hover:border-amber-700/60 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <FlaskConical size={13} />
                </span>
                <span className="text-sm font-semibold text-foreground truncate">
                  {e.name ?? `Experiment ${i + 1}`}
                </span>
              </div>
              {e.id && (
                <span className="text-[10px] font-mono text-muted-foreground bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                  {e.id}
                </span>
              )}
            </div>

            {e.hypothesis && (
              <div className="rounded-lg bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200/60 dark:border-amber-800/40 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-0.5">
                  Hypothesis
                </p>
                <p className="text-xs text-foreground/85 leading-relaxed italic">{e.hypothesis}</p>
              </div>
            )}

            {e.method && (
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Method</p>
                <p className="text-xs text-foreground/85 leading-relaxed">{e.method}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50">
              {e.timeline && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Clock size={9} /> Timeline
                  </span>
                  <span className="text-xs font-medium text-foreground">{e.timeline}</span>
                </div>
              )}
              {e.budget_usd !== undefined && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <DollarSign size={9} /> Budget
                  </span>
                  <span className="text-xs font-bold text-foreground tabular-nums">{fmtUsd(e.budget_usd)}</span>
                </div>
              )}
            </div>

            {e.success_metric && (
              <div className="flex items-center gap-2 text-xs">
                <Target size={11} className="text-emerald-500 shrink-0" />
                <span className="text-muted-foreground">Success:</span>
                <span className="font-medium text-foreground truncate">{e.success_metric}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// CAC Tracking --------------------------------------------------------------

function CacTrackingSection({ cac }: { cac: CacTracking }) {
  const byChannel = cac.by_channel ?? [];
  const totalSpend = byChannel.reduce((s, c) => s + (c.spend_usd ?? 0), 0);
  const avgCac = byChannel.length > 0
    ? byChannel.reduce((s, c) => s + (c.target_cac_usd ?? 0), 0) / byChannel.length
    : 0;

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        eyebrow="08 — Economics"
        icon={<Calculator size={14} />}
        title="CAC Tracking"
        subtitle="How you'll measure cost to acquire."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {cac.tracking_method && (
          <div className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3">
            <span className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
              <Hash size={15} />
            </span>
            <div className="flex flex-col min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tracking Method</p>
              <p className="text-sm font-medium text-foreground truncate">{cac.tracking_method}</p>
            </div>
          </div>
        )}
        {cac.weekly_review && (
          <div className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3">
            <span className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shrink-0">
              <RefreshCcw size={15} />
            </span>
            <div className="flex flex-col min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Weekly Review</p>
              <p className="text-sm font-medium text-foreground truncate">{cac.weekly_review}</p>
            </div>
          </div>
        )}
      </div>

      {cac.blended_cac_formula && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-linear-to-r from-amber-50/60 to-transparent dark:from-amber-950/20 px-5 py-3 flex items-center gap-3">
          <Calculator size={14} className="text-amber-500 shrink-0" />
          <div className="flex flex-col min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Blended CAC Formula
            </p>
            <code className="text-xs font-mono text-foreground/90 truncate">{cac.blended_cac_formula}</code>
          </div>
        </div>
      )}

      {byChannel.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              By Channel
            </p>
            <span className="ml-auto inline-flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>Total spend: <span className="font-mono text-foreground">{fmtUsd(totalSpend)}</span></span>
              <span>Avg target CAC: <span className="font-mono text-foreground">{fmtUsd(avgCac)}</span></span>
            </span>
          </div>
          <div className="divide-y divide-border">
            {byChannel.map((c, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-[1.5fr_2fr_1fr_1fr] gap-3 px-5 py-3 items-center">
                <div className="flex items-center gap-2">
                  <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    {channelIcon(c.channel)}
                  </span>
                  <span className="text-sm font-semibold text-foreground truncate">{c.channel}</span>
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground sm:hidden">Orders from: </span>
                  {c.orders_from_channel}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Spend</span>
                  <span className="text-sm font-bold text-foreground tabular-nums">{fmtUsd(c.spend_usd)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Target CAC</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{fmtUsd(c.target_cac_usd)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// Feedback Loops ------------------------------------------------------------

function FeedbackLoopsSection({ loops }: { loops: FeedbackLoop[] }) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        eyebrow="09 — Learn"
        icon={<RefreshCcw size={14} />}
        title="Feedback Loops"
        subtitle="How you'll close the loop on what you learn."
        count={loops.length}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {loops.map((loop, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <RefreshCcw size={13} />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                Loop {i + 1}
              </span>
            </div>

            {loop.trigger && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Trigger</p>
                <p className="text-sm font-semibold text-foreground leading-snug">{loop.trigger}</p>
              </div>
            )}

            {loop.method && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Method</p>
                <p className="text-xs text-foreground/80 leading-relaxed">{loop.method}</p>
              </div>
            )}

            {loop.what_to_capture && (
              <div className="rounded-lg bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200/60 dark:border-amber-800/40 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-0.5">Capture</p>
                <p className="text-xs text-foreground/85 leading-relaxed">{loop.what_to_capture}</p>
              </div>
            )}

            {loop.action && (
              <div className="flex items-start gap-2 pt-1 border-t border-border/50">
                <Zap size={11} className="mt-0.5 shrink-0 text-emerald-500" />
                <p className="text-xs text-foreground/85 leading-relaxed">{loop.action}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// Sources -------------------------------------------------------------------

function SourcesSection({
  sources,
  sourceMode,
  sourcesUsed,
}: {
  sources: SourceItem[];
  sourceMode?: string;
  sourcesUsed?: number;
}) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        eyebrow="10 — Research"
        icon={<Link2 size={14} />}
        title="Sources & Research"
        subtitle={sourceMode === "web_sourced" ? "Web-sourced research backing this analysis." : undefined}
        count={sourcesUsed ?? sources.length}
      />

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          {[0, 1].map((col) => (
            <ul key={col} className="divide-y divide-border">
              {sources
                .filter((_, i) => i % 2 === col)
                .map((s, i) => {
                  const realIndex = i * 2 + col + 1;
                  return (
                    <li key={i}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-3 px-5 py-3 hover:bg-amber-50/40 dark:hover:bg-amber-950/15 transition-colors"
                      >
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono text-muted-foreground shrink-0 mt-0.5 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                          {realIndex}
                        </span>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                            {s.title}
                          </p>
                          {s.url && (
                            <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                              <Link2 size={9} />
                              {s.url.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}
                            </p>
                          )}
                        </div>
                      </a>
                    </li>
                  );
                })}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

// Extra / fallback ----------------------------------------------------------

const KNOWN_KEYS = new Set([
  "summary", "go_to_market_strategy",
  "target_launch_segment", "positioning_message", "marketing_channels",
  "funnel_stages", "launch_experiments", "first_100_customers_plan",
  "launch_timeline", "cac_tracking", "feedback_loops",
  "source_mode", "sources_used", "sources_list",
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
            {(v as string[]).map((item, i) => <Pill key={i}>{item}</Pill>)}
          </div>
        );
      }
      return (
        <ul className="flex flex-col gap-2">
          {v.map((item, i) => (
            <li key={i} className="rounded-lg border border-border bg-neutral-50/60 dark:bg-neutral-900/40 p-3">
              {typeof item === "object" && item !== null
                ? renderValue(item)
                : <span className="text-xs text-foreground/80">{String(item)}</span>}
            </li>
          ))}
        </ul>
      );
    }
    if (typeof v === "object") {
      return (
        <div className="flex flex-col gap-2">
          {Object.entries(v as Record<string, unknown>)
            .filter(([, val]) => val !== null && val !== undefined && val !== "")
            .map(([k, val]) => (
              <div key={k} className="flex flex-col gap-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{toLabel(k)}</p>
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
      <SectionHeader icon={<ChevronRight size={14} />} title={label} />
      <div className="rounded-xl border border-border bg-card p-5">{rendered}</div>
    </section>
  );
}

function GoToMarketSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-pulse">
      <div className="h-32 rounded-2xl bg-neutral-200 dark:bg-neutral-700" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="h-4 w-40 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-32 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
        </div>
      ))}
    </div>
  );
}

// Main ----------------------------------------------------------------------

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
    go_to_market_strategy,
    target_launch_segment,
    positioning_message,
    marketing_channels,
    funnel_stages,
    launch_experiments,
    first_100_customers_plan,
    launch_timeline,
    cac_tracking,
    feedback_loops,
    source_mode,
    sources_used,
    sources_list,
  } = structured;

  const channels = marketing_channels ?? [];
  const funnel = funnel_stages ?? [];
  const experiments = launch_experiments ?? [];
  const timelineWeeks = launch_timeline ?? [];
  const loops = feedback_loops ?? [];
  const sources = sources_list ?? [];

  const extraFields = Object.entries(structured).filter(
    ([k, v]) => !KNOWN_KEYS.has(k) && v !== null && v !== undefined && v !== ""
  );

  return (
    <div className="flex flex-col gap-12">

      <HeroOverview
        summary={summary ?? go_to_market_strategy}
        segment={target_launch_segment}
        totalBudget={first_100_customers_plan?.total_estimated_budget_usd}
        timeline={first_100_customers_plan?.target_timeline}
        channelCount={channels.length}
        experimentCount={experiments.length}
        funnelStages={funnel.length}
      />

      {target_launch_segment && <TargetSegmentCard segment={target_launch_segment} />}

      {positioning_message && <PositioningMessageCard msg={positioning_message} />}

      {channels.length > 0 && <MarketingChannelsSection channels={channels} />}

      {funnel.length > 0 && <FunnelStagesSection stages={funnel} />}

      {first_100_customers_plan && <First100Section plan={first_100_customers_plan} />}

      {timelineWeeks.length > 0 && <LaunchTimelineSection weeks={timelineWeeks} />}

      {experiments.length > 0 && <ExperimentsSection experiments={experiments} />}

      {cac_tracking && <CacTrackingSection cac={cac_tracking} />}

      {loops.length > 0 && <FeedbackLoopsSection loops={loops} />}

      {sources.length > 0 && (
        <SourcesSection sources={sources} sourceMode={source_mode} sourcesUsed={sources_used} />
      )}

      {extraFields.map(([key, value]) => (
        <ExtraField key={key} label={toLabel(key)} value={value} />
      ))}

    </div>
  );
}

"use client";

import {
  Rocket, Loader2, AlertCircle, Target, AlertTriangle, CheckCircle2, XCircle,
  Workflow, Layers, FlaskConical, Flag, ClipboardCheck, Users, BookOpen,
  ExternalLink, Calendar, DollarSign, Wrench, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

// Types

interface Assumption {
  id?: string;
  assumption?: string;
  risk_level?: string;
  validation_method?: string;
  kill_signal?: string;
}

interface UserFlow {
  id?: string;
  name?: string;
  steps?: string[];
  success_metric?: string;
}

interface Phase {
  phase?: string | number;
  name?: string;
  tasks?: string[];
  milestone?: string;
}

interface Milestone {
  title?: string;
  phase_number?: number | string;
  phase_name?: string;
  week_start?: number | string;
  week_end?: number | string;
  duration_weeks?: number | string;
  description?: string;
  roles_needed?: string[];
  required_resources?: string[];
  tags?: string[];
  is_critical_path?: boolean;
}

interface Experiment {
  id?: string;
  hypothesis?: string;
  method?: string;
  success_metric?: string;
  timeline?: string;
  cost_usd?: number;
}

interface TestingPlanItem {
  area?: string;
  method?: string;
  pass_criteria?: string;
}

interface Source {
  url?: string;
  title?: string;
}

interface MvpData {
  mvp_goal?: string;
  riskiest_assumptions?: Assumption[];
  scope?: { included?: string[]; excluded?: string[] };
  core_user_flows?: UserFlow[];
  build_plan?: {
    phases?: Phase[];
    total_timeline?: string;
    no_code_tools_needed?: string[];
  };
  validation_experiments?: Experiment[];
  launch_criteria?: {
    must_be_true?: string[];
    success_metrics?: string[];
    kill_criteria?: string[];
  };
  testing_plan?: TestingPlanItem[];
  qa_checklist?: string[];
  first_100_users_plan?: string;
  milestones?: Milestone[];
  summary?: string;
  source_mode?: string;
  sources_used?: number;
  sources_list?: Source[];
}

// Helpers

function riskTone(level?: string): string {
  const l = (level ?? "").toLowerCase();
  if (l === "high") return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40";
  if (l === "medium") return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40";
  return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40";
}

// Section primitives

function SectionBlock({
  icon, title, accent, children,
}: { icon: React.ReactNode; title: string; accent?: string; children: React.ReactNode }) {
  return (
    <section className="bg-card border border-border rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          accent ?? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
        )}>
          {icon}
        </div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
      {children}
    </p>
  );
}

// Sub-sections

function GoalCard({ goal, summary }: { goal?: string; summary?: string }) {
  if (!goal && !summary) return null;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 via-yellow-50 to-white dark:from-amber-900/20 dark:via-yellow-900/10 dark:to-neutral-900 p-5 sm:p-6">
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />
      <div className="relative flex flex-col gap-4">
        {goal && (
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-[0_4px_16px_rgba(255,183,3,0.3)] shrink-0">
              <Target size={18} className="text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <Label>MVP Goal</Label>
              <p className="text-sm sm:text-base text-foreground leading-relaxed font-medium">{goal}</p>
            </div>
          </div>
        )}
        {summary && (
          <div className="pt-3 border-t border-amber-200/60 dark:border-amber-800/30">
            <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AssumptionsBlock({ items }: { items?: Assumption[] }) {
  if (!items?.length) return null;
  return (
    <SectionBlock
      icon={<AlertTriangle size={16} />}
      title="Riskiest Assumptions"
      accent="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {items.map((a, i) => (
          <div key={a.id ?? i} className="rounded-xl border border-border bg-background/50 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-muted-foreground tracking-widest">{a.id ?? `A${i + 1}`}</span>
              {a.risk_level && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border",
                  riskTone(a.risk_level)
                )}>
                  {a.risk_level} risk
                </span>
              )}
            </div>
            {a.assumption && (
              <p className="text-sm text-foreground leading-relaxed font-medium">{a.assumption}</p>
            )}
            {a.validation_method && (
              <div className="flex flex-col gap-1">
                <Label>Validation</Label>
                <p className="text-xs text-muted-foreground leading-relaxed">{a.validation_method}</p>
              </div>
            )}
            {a.kill_signal && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50/60 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                <XCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Kill signal</span>
                  <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">{a.kill_signal}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}

function ScopeBlock({ scope }: { scope?: MvpData["scope"] }) {
  if (!scope || (!scope.included?.length && !scope.excluded?.length)) return null;
  return (
    <SectionBlock
      icon={<Layers size={16} />}
      title="Scope"
      accent="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-900/10 p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Included</span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {(scope.included ?? []).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-900/40 p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <XCircle size={15} className="text-neutral-500 dark:text-neutral-400" />
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Excluded</span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {(scope.excluded ?? []).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed line-through decoration-neutral-400/40">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionBlock>
  );
}

function UserFlowsBlock({ flows }: { flows?: UserFlow[] }) {
  if (!flows?.length) return null;
  return (
    <SectionBlock
      icon={<Workflow size={16} />}
      title="Core User Flows"
      accent="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {flows.map((f, i) => (
          <div key={f.id ?? i} className="rounded-xl border border-border bg-background/50 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-center">
                  {f.id ?? `UF${i + 1}`}
                </span>
                <span className="text-sm font-semibold text-foreground">{f.name ?? "Flow"}</span>
              </div>
            </div>
            {f.steps?.length ? (
              <ol className="flex flex-col gap-1.5">
                {f.steps.map((step, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
                    <span className="mt-0.5 min-w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {j + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            ) : null}
            {f.success_metric && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-purple-50/60 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30">
                <Target size={13} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Success metric</span>
                  <p className="text-xs text-foreground leading-relaxed">{f.success_metric}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}

function BuildPlanBlock({ plan }: { plan?: MvpData["build_plan"] }) {
  if (!plan) return null;
  const { phases, total_timeline, no_code_tools_needed } = plan;
  if (!phases?.length && !total_timeline && !no_code_tools_needed?.length) return null;

  return (
    <SectionBlock
      icon={<Rocket size={16} />}
      title="Build Plan"
      accent="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
    >
      {total_timeline && (
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/10 border border-amber-200/60 dark:border-amber-800/40 w-fit">
          <Calendar size={14} className="text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            Timeline: {total_timeline}
          </span>
        </div>
      )}

      {phases?.length ? (
        <div className="flex flex-col gap-3">
          {phases.map((p, i) => (
            <div key={i} className="relative pl-10">
              {i < phases.length - 1 && (
                <span className="absolute left-3.5 top-7 bottom-[-12px] w-px bg-amber-200 dark:bg-amber-800/40" />
              )}
              <span className="absolute left-0 top-0 w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 text-white text-xs font-bold flex items-center justify-center shadow-[0_2px_8px_rgba(255,183,3,0.3)]">
                {p.phase ?? i + 1}
              </span>
              <div className="rounded-xl border border-border bg-background/50 p-4 flex flex-col gap-2.5">
                <h4 className="text-sm font-semibold text-foreground">{p.name ?? `Phase ${p.phase ?? i + 1}`}</h4>
                {p.tasks?.length ? (
                  <ul className="flex flex-col gap-1.5">
                    {p.tasks.map((t, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                        <ChevronRight size={14} className="mt-0.5 text-amber-500 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {p.milestone && (
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-200/60 dark:border-emerald-900/30 w-fit">
                    <Flag size={12} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{p.milestone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {no_code_tools_needed?.length ? (
        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Wrench size={13} className="text-muted-foreground" />
            <Label>No-code tools</Label>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {no_code_tools_needed.map((t, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-foreground border border-border">
                {t}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </SectionBlock>
  );
}

function ExperimentsBlock({ items }: { items?: Experiment[] }) {
  if (!items?.length) return null;
  return (
    <SectionBlock
      icon={<FlaskConical size={16} />}
      title="Validation Experiments"
      accent="bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {items.map((e, i) => (
          <div key={e.id ?? i} className="rounded-xl border border-border bg-background/50 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-muted-foreground tracking-widest">{e.id ?? `E${i + 1}`}</span>
              <div className="flex items-center gap-1.5">
                {e.timeline && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 text-[10px] font-semibold">
                    <Calendar size={10} />
                    {e.timeline}
                  </span>
                )}
                {typeof e.cost_usd === "number" && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                    <DollarSign size={10} />
                    {e.cost_usd}
                  </span>
                )}
              </div>
            </div>
            {e.hypothesis && (
              <p className="text-sm text-foreground font-medium leading-relaxed">{e.hypothesis}</p>
            )}
            {e.method && (
              <div className="flex flex-col gap-1">
                <Label>Method</Label>
                <p className="text-xs text-muted-foreground leading-relaxed">{e.method}</p>
              </div>
            )}
            {e.success_metric && (
              <div className="flex flex-col gap-1">
                <Label>Success metric</Label>
                <p className="text-xs text-foreground leading-relaxed">{e.success_metric}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionBlock>
  );
}

function CriteriaList({
  title, items, tone, icon,
}: { title: string; items?: string[]; tone: "success" | "warn" | "danger"; icon: React.ReactNode }) {
  if (!items?.length) return null;
  const toneClasses = {
    success: "border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-900/10",
    warn:    "border-amber-200/60   dark:border-amber-900/40   bg-amber-50/40   dark:bg-amber-900/10",
    danger:  "border-red-200/60     dark:border-red-900/40     bg-red-50/40     dark:bg-red-900/10",
  }[tone];
  const dotClasses = {
    success: "bg-emerald-500",
    warn:    "bg-amber-500",
    danger:  "bg-red-500",
  }[tone];
  const titleClasses = {
    success: "text-emerald-700 dark:text-emerald-300",
    warn:    "text-amber-700   dark:text-amber-300",
    danger:  "text-red-700     dark:text-red-300",
  }[tone];

  return (
    <div className={cn("rounded-xl border p-4 flex flex-col gap-2.5", toneClasses)}>
      <div className="flex items-center gap-2">
        {icon}
        <span className={cn("text-sm font-semibold", titleClasses)}>{title}</span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {items.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
            <span className={cn("mt-2 w-1.5 h-1.5 rounded-full shrink-0", dotClasses)} />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LaunchCriteriaBlock({ criteria }: { criteria?: MvpData["launch_criteria"] }) {
  if (!criteria) return null;
  const { must_be_true, success_metrics, kill_criteria } = criteria;
  if (!must_be_true?.length && !success_metrics?.length && !kill_criteria?.length) return null;
  return (
    <SectionBlock
      icon={<Flag size={16} />}
      title="Launch Criteria"
      accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <CriteriaList
          title="Must be true"
          items={must_be_true}
          tone="success"
          icon={<CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />}
        />
        <CriteriaList
          title="Success metrics"
          items={success_metrics}
          tone="warn"
          icon={<Target size={15} className="text-amber-600 dark:text-amber-400" />}
        />
        <CriteriaList
          title="Kill criteria"
          items={kill_criteria}
          tone="danger"
          icon={<XCircle size={15} className="text-red-600 dark:text-red-400" />}
        />
      </div>
    </SectionBlock>
  );
}

function TestingPlanBlock({ items, qaChecklist }: { items?: TestingPlanItem[]; qaChecklist?: string[] }) {
  if (!items?.length && !qaChecklist?.length) return null;
  return (
    <SectionBlock
      icon={<ClipboardCheck size={16} />}
      title="Testing & QA"
      accent="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
    >
      {items?.length ? (
        <div className="flex flex-col gap-2">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 py-3 rounded-xl border border-border bg-background/50">
              <div className="sm:col-span-3 flex flex-col gap-0.5">
                <Label>Area</Label>
                <p className="text-sm font-medium text-foreground">{it.area ?? "-"}</p>
              </div>
              <div className="sm:col-span-4 flex flex-col gap-0.5">
                <Label>Method</Label>
                <p className="text-sm text-muted-foreground">{it.method ?? "-"}</p>
              </div>
              <div className="sm:col-span-5 flex flex-col gap-0.5">
                <Label>Pass criteria</Label>
                <p className="text-sm text-foreground">{it.pass_criteria ?? "-"}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {qaChecklist?.length ? (
        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <Label>QA Checklist</Label>
          <ul className="flex flex-col gap-1.5">
            {qaChecklist.map((q, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
                <CheckCircle2 size={15} className="mt-0.5 text-indigo-500 shrink-0" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </SectionBlock>
  );
}

function FirstUsersBlock({ plan }: { plan?: string }) {
  if (!plan) return null;
  return (
    <SectionBlock
      icon={<Users size={16} />}
      title="First 100 Users Plan"
      accent="bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400"
    >
      <p className="text-sm text-foreground leading-relaxed">{plan}</p>
    </SectionBlock>
  );
}

function MilestonesBlock({ items }: { items?: Milestone[] }) {
  if (!items?.length) return null;
  return (
    <SectionBlock
      icon={<Flag size={16} />}
      title="Milestones"
      accent="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {items.map((m, i) => (
          <article key={`${m.title ?? "milestone"}-${i}`} className="rounded-xl border border-border bg-background/50 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200/60 dark:border-emerald-900/40">
                    Week {m.week_start ?? "?"}-{m.week_end ?? "?"}
                  </span>
                  {m.is_critical_path && (
                    <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-[10px] font-semibold border border-red-200/60 dark:border-red-900/40">
                      Critical path
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-foreground leading-snug">{m.title ?? `Milestone ${i + 1}`}</h4>
              </div>
              <span className="shrink-0 w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center">
                {m.phase_number ?? i + 1}
              </span>
            </div>

            {(m.phase_name || m.duration_weeks) && (
              <div className="flex flex-wrap gap-1.5">
                {m.phase_name && <span className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs text-foreground border border-border">{m.phase_name}</span>}
                {m.duration_weeks && <span className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs text-foreground border border-border">{m.duration_weeks} weeks</span>}
              </div>
            )}

            {m.description && <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>}

            {!!m.roles_needed?.length && (
              <div className="flex flex-col gap-1.5">
                <Label>Roles needed</Label>
                <div className="flex flex-wrap gap-1.5">
                  {m.roles_needed.map((role, j) => (
                    <span key={j} className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[11px] font-medium border border-blue-200/60 dark:border-blue-900/40">{role}</span>
                  ))}
                </div>
              </div>
            )}

            {!!m.required_resources?.length && (
              <div className="flex flex-col gap-1.5">
                <Label>Resources</Label>
                <ul className="flex flex-col gap-1">
                  {m.required_resources.map((resource, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                      <ChevronRight size={13} className="mt-0.5 text-emerald-500 shrink-0" />
                      <span>{resource}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!!m.tags?.length && (
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border">
                {m.tags.map((tag, j) => (
                  <span key={j} className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{tag}</span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </SectionBlock>
  );
}
function SourcesBlock({ mode, used, list }: { mode?: string; used?: number; list?: Source[] }) {
  if (!list?.length && !mode && used == null) return null;
  const sources = (list ?? []).filter((s) => s.url);
  return (
    <SectionBlock
      icon={<BookOpen size={16} />}
      title="Sources"
      accent="bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
    >
      {(mode || used != null) && (
        <div className="flex flex-wrap items-center gap-2">
          {mode && (
            <span className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-foreground border border-border capitalize">
              {mode.replace(/_/g, " ")}
            </span>
          )}
          {used != null && (
            <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200/60 dark:border-amber-800/40">
              {used} {used === 1 ? "source" : "sources"} used
            </span>
          )}
        </div>
      )}

      {sources.length ? (
        <ul className="flex flex-col gap-2">
          {sources.map((s, i) => (
            <li key={i}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 px-3 py-2.5 rounded-xl border border-border bg-background/50 hover:border-amber-300 hover:bg-amber-50/30 dark:hover:border-amber-700 dark:hover:bg-amber-900/10 transition-colors"
              >
                <span className="mt-0.5 w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors line-clamp-1">
                    {s.title ?? s.url}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">{s.url}</span>
                </div>
                <ExternalLink size={14} className="mt-1 text-muted-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors shrink-0" />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </SectionBlock>
  );
}

// Skeleton / error / empty

function MvpSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-28 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function MvpEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-dashed border-border bg-card gap-2">
      <Loader2 size={18} className="text-muted-foreground animate-spin opacity-0" />
      <p className="text-sm text-muted-foreground">No MVP plan yet.</p>
    </div>
  );
}

// Header

function MvpHeader() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(255,183,3,0.3)]">
        <Rocket size={16} />
      </div>
      <h2 className="text-xl font-semibold text-foreground">MVP Planning</h2>
    </div>
  );
}

// Main component

export function MvpPlanningSection({ data, isLoading, error }: SectionState) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <MvpHeader />
        <MvpSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <MvpHeader />
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/20 text-red-600 dark:text-red-400">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-4">
        <MvpHeader />
        <MvpEmpty />
      </div>
    );
  }

  let parsed: MvpData | null = null;
  try {
    const p = JSON.parse(data) as unknown;
    if (p && typeof p === "object") parsed = p as MvpData;
  } catch {
    // fall through - render raw text as a paragraph
  }

  if (!parsed) {
    return (
      <div className="flex flex-col gap-4">
        <MvpHeader />
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{data}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <MvpHeader />
      <GoalCard goal={parsed.mvp_goal} summary={parsed.summary} />
      <AssumptionsBlock items={parsed.riskiest_assumptions} />
      <ScopeBlock scope={parsed.scope} />
      <UserFlowsBlock flows={parsed.core_user_flows} />
      <BuildPlanBlock plan={parsed.build_plan} />
      <ExperimentsBlock items={parsed.validation_experiments} />
      <LaunchCriteriaBlock criteria={parsed.launch_criteria} />
      <TestingPlanBlock items={parsed.testing_plan} qaChecklist={parsed.qa_checklist} />
      <FirstUsersBlock plan={parsed.first_100_users_plan} />
      <MilestonesBlock items={parsed.milestones} />
      <SourcesBlock mode={parsed.source_mode} used={parsed.sources_used} list={parsed.sources_list} />
    </div>
  );
}

"use client";

import {
  ListChecks, AlertCircle, CheckCircle2, XCircle,
  Cpu, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FunctionItem {
  id?: string;
  name?: string;
  description?: string;
  priority?: string;
  category?: string;
  user_story?: string;
  acceptance_criteria?: string[];
  tech_stack?: string[];
  effort?: string;
}

interface FunctionsListData {
  summary?: string;
  core_functions?: FunctionItem[];
  functions?: FunctionItem[];
  nice_to_have?: string[] | FunctionItem[];
  out_of_scope?: string[];
  tech_requirements?: string[];
  categories?: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function priorityTone(level?: string) {
  const l = (level ?? "").toLowerCase();
  if (l === "high") return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40";
  if (l === "medium") return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/40";
  return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40";
}

const CATEGORY_COLORS = [
  "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/40",
  "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/40",
  "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-900/40",
  "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/40",
  "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-900/40",
  "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-900/40",
];

// ─── Primitives ───────────────────────────────────────────────────────────────

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

// ─── Summary Banner ───────────────────────────────────────────────────────────

function SummaryCard({ summary }: { summary: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 via-yellow-50 to-white dark:from-amber-900/20 dark:via-yellow-900/10 dark:to-neutral-900 p-5 sm:p-6">
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />
      <div className="relative flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-[0_4px_16px_rgba(255,183,3,0.3)] shrink-0">
          <ListChecks size={18} className="text-white" />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Overview</Label>
          <p className="text-sm sm:text-base text-foreground leading-relaxed">{summary}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────

function FeatureCard({
  item, index, categoryMap,
}: { item: FunctionItem; index: number; categoryMap: Map<string, number> }) {
  const id = item.id ?? `F${index + 1}`;
  const priority = item.priority ?? "";
  const tone = priorityTone(priority);
  const catColorIndex = item.category != null ? (categoryMap.get(item.category) ?? 0) : index;
  const catColor = item.category ? CATEGORY_COLORS[catColorIndex % CATEGORY_COLORS.length] : null;

  return (
    <article className="rounded-xl border border-border bg-background/50 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[11px] font-bold flex items-center justify-center px-2 shrink-0">
            {id}
          </span>
          {item.name && (
            <h4 className="text-sm font-semibold text-foreground leading-snug">{item.name}</h4>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {priority && (
            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border", tone)}>
              {priority}
            </span>
          )}
          {item.effort && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-muted-foreground border border-border">
              {item.effort}
            </span>
          )}
        </div>
      </div>

      {item.category && catColor && (
        <span className={cn("self-start px-2 py-0.5 rounded-full text-[10px] font-semibold border", catColor)}>
          {item.category}
        </span>
      )}

      {item.description && (
        <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
      )}

      {item.user_story && (
        <div className="px-3 py-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
          <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">
            User story
          </p>
          <p className="text-xs text-foreground leading-relaxed italic">{item.user_story}</p>
        </div>
      )}

      {item.acceptance_criteria?.length ? (
        <div className="flex flex-col gap-1.5">
          <Label>Acceptance criteria</Label>
          <ul className="flex flex-col gap-1">
            {item.acceptance_criteria.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground leading-relaxed">
                <CheckCircle2 size={13} className="mt-0.5 text-emerald-500 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {item.tech_stack?.length ? (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border">
          {item.tech_stack.map((t, i) => (
            <span
              key={i}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] font-medium text-foreground border border-border"
            >
              <Cpu size={9} className="text-muted-foreground shrink-0" />
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

// ─── Core Functions ───────────────────────────────────────────────────────────

function CoreFunctionsBlock({ items }: { items: FunctionItem[] }) {
  const categoryMap = new Map<string, number>();
  let catIdx = 0;
  items.forEach((item) => {
    if (item.category && !categoryMap.has(item.category)) categoryMap.set(item.category, catIdx++);
  });

  return (
    <SectionBlock
      icon={<ListChecks size={16} />}
      title="Core Functions"
      accent="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {items.map((item, i) => (
          <FeatureCard key={item.id ?? i} item={item} index={i} categoryMap={categoryMap} />
        ))}
      </div>
    </SectionBlock>
  );
}

// ─── Nice to Have ─────────────────────────────────────────────────────────────

function NiceToHaveBlock({ items }: { items: string[] | FunctionItem[] }) {
  const isStrings = items.every((i) => typeof i === "string");

  return (
    <SectionBlock
      icon={<Package size={16} />}
      title="Nice to Have"
      accent="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
    >
      {isStrings ? (
        <ul className="flex flex-col gap-2">
          {(items as string[]).map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-purple-400 dark:bg-purple-500 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {(items as FunctionItem[]).map((item, i) => (
            <div key={i} className="rounded-xl border border-border bg-background/50 p-4 flex flex-col gap-2">
              {item.name && <p className="text-sm font-medium text-foreground">{item.name}</p>}
              {item.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionBlock>
  );
}

// ─── Out of Scope ─────────────────────────────────────────────────────────────

function OutOfScopeBlock({ items }: { items: string[] }) {
  return (
    <SectionBlock
      icon={<XCircle size={16} />}
      title="Out of Scope"
      accent="bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
    >
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed line-through decoration-neutral-400/40">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0 [text-decoration:none]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </SectionBlock>
  );
}

// ─── Tech Requirements ────────────────────────────────────────────────────────

function TechRequirementsBlock({ items }: { items: string[] }) {
  return (
    <SectionBlock
      icon={<Cpu size={16} />}
      title="Tech Requirements"
      accent="bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400"
    >
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-foreground border border-border"
          >
            {item}
          </span>
        ))}
      </div>
    </SectionBlock>
  );
}

// ─── Skeleton / Empty / Error ─────────────────────────────────────────────────

function FunctionsSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-44 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
        ))}
      </div>
    </div>
  );
}

function FunctionsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-dashed border-border bg-card gap-2">
      <ListChecks size={20} className="text-muted-foreground opacity-30" />
      <p className="text-sm text-muted-foreground">No functions list yet. Run the pipeline to generate it.</p>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function FunctionsHeader() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(255,183,3,0.3)]">
        <ListChecks size={16} />
      </div>
      <h2 className="text-xl font-semibold text-foreground">Functions List</h2>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function FunctionsListSection({ data, isLoading, error }: SectionState) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <FunctionsHeader />
        <FunctionsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <FunctionsHeader />
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
        <FunctionsHeader />
        <FunctionsEmpty />
      </div>
    );
  }

  let parsed: FunctionsListData | null = null;
  try {
    const p = JSON.parse(data) as unknown;
    if (p && typeof p === "object") parsed = p as FunctionsListData;
  } catch {
    // not JSON — fall through to raw text
  }

  if (!parsed) {
    return (
      <div className="flex flex-col gap-4">
        <FunctionsHeader />
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{data}</p>
        </div>
      </div>
    );
  }

  const coreFunctions = parsed.core_functions ?? parsed.functions ?? [];
  const niceToHave = parsed.nice_to_have;
  const outOfScope = parsed.out_of_scope;
  const techRequirements = parsed.tech_requirements;

  return (
    <div className="flex flex-col gap-5">
      <FunctionsHeader />
      {parsed.summary && <SummaryCard summary={parsed.summary} />}
      {coreFunctions.length > 0 && <CoreFunctionsBlock items={coreFunctions} />}
      {niceToHave && niceToHave.length > 0 && <NiceToHaveBlock items={niceToHave} />}
      {outOfScope && outOfScope.length > 0 && <OutOfScopeBlock items={outOfScope} />}
      {techRequirements && techRequirements.length > 0 && <TechRequirementsBlock items={techRequirements} />}
    </div>
  );
}

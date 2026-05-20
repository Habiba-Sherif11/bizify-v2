"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  Home, ChevronRight, FileDown, Share2, Sparkles,
  Play, Loader2, AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { api } from "@/features/auth/lib/api";
import { cn } from "@/lib/utils";
import { formatIdeaDate } from "@/features/entrepreneur/hooks/useIdeas";
import { useAiPipeline } from "@/features/entrepreneur/hooks/useAiPipeline";
import type { Idea } from "@/features/entrepreneur/types/idea";

import { CustomersSection }       from "@/features/entrepreneur/components/analysis/CustomersSection";
import { CompetitionSection }     from "@/features/entrepreneur/components/analysis/CompetitionSection";
import { MarketPotentialSection } from "@/features/entrepreneur/components/analysis/MarketPotentialSection";
import { BusinessModelSection }   from "@/features/entrepreneur/components/analysis/BusinessModelSection";
import { MvpPlanningSection }     from "@/features/entrepreneur/components/analysis/MvpPlanningSection";
import { ProblemsSection }        from "@/features/entrepreneur/components/analysis/ProblemsSection";
import { UnitEconomicsSection }   from "@/features/entrepreneur/components/analysis/UnitEconomicsSection";
import { IdeaStrategySection }    from "@/features/entrepreneur/components/analysis/IdeaStrategySection";
import { GoToMarketSection }      from "@/features/entrepreneur/components/analysis/GoToMarketSection";
import { FunctionsListSection }   from "@/features/entrepreneur/components/analysis/FunctionsListSection";
import { SectionControls }        from "@/features/entrepreneur/components/analysis/SectionControls";
import type { AiSectionKey }      from "@/features/entrepreneur/hooks/useAiSection";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type TabKey =
  | "overview"
  | "customers"
  | "competition"
  | "market"
  | "businessModel"
  | "functions"
  | "mvp"
  | "risk"
  | "financial"
  | "goToMarket";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview",      label: "Overview"           },
  { key: "customers",     label: "Customers"          },
  { key: "competition",   label: "Competition"        },
  { key: "market",        label: "Market"             },
  { key: "businessModel", label: "Business Model"     },
  { key: "functions",     label: "Functions"          },
  { key: "mvp",           label: "MVP"                },
  { key: "risk",          label: "Risk"               },
  { key: "financial",     label: "Financial"          },
  { key: "goToMarket",    label: "Go-to-Market"       },
];

// ─── Tab content ──────────────────────────────────────────────────────────────

// Maps each tab to (1) its section state key and (2) the AI section key
// the SectionControls component uses. "risk" (problems) has no per-section
// AI controls, so it's mapped to undefined.
const TAB_TO_SECTION: Record<
  Exclude<TabKey, "overview">,
  { stateKey: keyof ReturnType<typeof useAiPipeline>["sections"]; aiKey?: AiSectionKey }
> = {
  customers:     { stateKey: "customers",       aiKey: "customers" },
  competition:   { stateKey: "competition",     aiKey: "competition" },
  market:        { stateKey: "marketPotential", aiKey: "marketPotential" },
  businessModel: { stateKey: "businessModel",   aiKey: "businessModel" },
  functions:     { stateKey: "functionsList",   aiKey: "functionsList" },
  mvp:           { stateKey: "mvpPlanning",     aiKey: "mvpPlanning" },
  risk:          { stateKey: "problems"         },
  financial:     { stateKey: "unitEconomics",   aiKey: "unitEconomics" },
  goToMarket:    { stateKey: "goToMarket",      aiKey: "goToMarket" },
};

function TabContent({
  tab,
  idea,
  sections,
  hasRun,
  onRun,
  isRunning,
  onRefreshSection,
}: {
  tab: TabKey;
  idea: Idea;
  sections: ReturnType<typeof useAiPipeline>["sections"];
  hasRun: boolean;
  onRun: () => void;
  isRunning: boolean;
  onRefreshSection: (key: keyof ReturnType<typeof useAiPipeline>["sections"]) => void;
}) {
  if (tab === "overview") {
    return <OverviewSection idea={idea} sections={sections} hasRun={hasRun} onRun={onRun} isRunning={isRunning} />;
  }

  const sectionMap: Record<Exclude<TabKey, "overview">, React.ReactNode> = {
    customers:     <CustomersSection       {...sections.customers}       />,
    competition:   <CompetitionSection     {...sections.competition}     />,
    market:        <MarketPotentialSection {...sections.marketPotential} />,
    businessModel: <BusinessModelSection   {...sections.businessModel}   />,
    functions:     <FunctionsListSection   {...sections.functionsList}   />,
    mvp:           <MvpPlanningSection     {...sections.mvpPlanning}     />,
    risk:          <ProblemsSection        {...sections.problems}        />,
    financial:     <UnitEconomicsSection   {...sections.unitEconomics}   />,
    goToMarket:    <GoToMarketSection      {...sections.goToMarket}      />,
  };

  const meta = TAB_TO_SECTION[tab as Exclude<TabKey, "overview">];
  const s = sections[meta.stateKey];

  if (!hasRun && !s.data && !s.isLoading) {
    return <PipelineCallToAction onRun={onRun} isRunning={isRunning} />;
  }

  return (
    <>
      {meta.aiKey && s.data && (
        <SectionControls
          sectionKey={meta.aiKey}
          onRefresh={() => onRefreshSection(meta.stateKey)}
        />
      )}
      {sectionMap[tab as Exclude<TabKey, "overview">]}
    </>
  );
}

function OverviewSection({
  idea,
  sections,
  hasRun,
  onRun,
  isRunning,
}: {
  idea: Idea;
  sections: ReturnType<typeof useAiPipeline>["sections"];
  hasRun: boolean;
  onRun: () => void;
  isRunning: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Idea meta card */}
      <div className="bg-card rounded-xl border border-border p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-foreground">Idea Overview</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {idea.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
          <MetaStat label="Budget" value={idea.budget != null ? `$${idea.budget.toLocaleString()}` : "—"} />
          <MetaStat label="Feasibility" value={idea.feasibility != null ? `${idea.feasibility} / 10` : "—"} />
          <MetaStat label="Status" value={idea.status ?? "—"} />
        </div>

        {(idea.skills?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {idea.skills!.map((s, i) => {
              const label = typeof s.name === "string" ? s.name : String(Object.values(s)[0] ?? i);
              return (
                <span key={label + i} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                  {label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Strategy */}
      {hasRun || sections.ideaStrategy.data || sections.ideaStrategy.isLoading ? (
        <IdeaStrategySection {...sections.ideaStrategy} />
      ) : (
        <PipelineCallToAction onRun={onRun} isRunning={isRunning} />
      )}
    </div>
  );
}

function MetaStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-0.5 capitalize">{value}</p>
    </div>
  );
}

function PipelineCallToAction({ onRun, isRunning }: { onRun: () => void; isRunning: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-72 gap-5 rounded-2xl border-2 border-dashed border-border bg-card">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-[0_4px_16px_rgba(255,183,3,0.3)]">
        <Sparkles size={22} className="text-white" />
      </div>
      <div className="text-center space-y-1.5 px-6">
        <h3 className="text-base font-semibold text-foreground">No analysis yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Run the AI pipeline to generate in-depth insights for this idea.
        </p>
      </div>
      <button
        type="button"
        onClick={onRun}
        disabled={isRunning}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer transition-opacity",
          "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-[0_2px_12px_rgba(255,183,3,0.3)]",
          isRunning && "opacity-60 cursor-not-allowed"
        )}
      >
        {isRunning ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
        {isRunning ? "Running…" : "Run Pipeline"}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IdeaDetailPage({
  params,
}: {
  params: Promise<{ idea_id: string }>;
}) {
  const { idea_id } = use(params);
  const [idea, setIdea]     = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const { sections, isRunning, hasRun, runError, runPipeline, fetchSection } = useAiPipeline();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    api
      .get<Idea>(`/ideas/${idea_id}`)
      .then(({ data }) => setIdea(data))
      .catch(() => setFetchError("Failed to load idea."))
      .finally(() => setLoading(false));
  }, [idea_id]);

  const handleExportPdf = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const { data: job } = await api.post<{ id: string }>("/export", {
        idea_id,
        format: "pdf",
      });

      // Poll until ready (max 90 s)
      const deadline = Date.now() + 90_000;
      let jobId = job.id;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 2_000));
        const { data: status } = await api.get<{ id: string; status: string }>(`/export/${jobId}`);
        jobId = status.id;
        if (status.status === "done" || status.status === "completed") {
          // Trigger browser download
          const link = document.createElement("a");
          link.href = `/api/export/${jobId}/download`;
          link.download = `${idea?.title ?? "idea"}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success("PDF downloaded");
          return;
        }
        if (status.status === "failed" || status.status === "error") {
          throw new Error("Export failed on server");
        }
      }
      throw new Error("Export timed out");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "PDF export failed";
      toast.error(msg);
    } finally {
      setIsExporting(false);
    }
  }, [idea_id, idea?.title, isExporting]);

  // ── Loading / error states ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (fetchError || !idea) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center gap-3 text-red-500">
        <AlertCircle size={18} />
        <p className="text-sm">{fetchError ?? "Idea not found."}</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 pt-6 pb-4 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/entrepreneur" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <Home size={14} />
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <Link href="/entrepreneur/ideas" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            Ideas
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200 font-medium truncate max-w-[200px]">
            {idea.title ?? "Untitled idea"}
          </span>
        </nav>

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          {/* Title + date */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">{idea.title ?? "Untitled idea"}</h1>
            <p className="text-base text-muted-foreground">{formatIdeaDate(idea.created_at)}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-8 shrink-0">
            {/* Pipeline status */}
            {isRunning && (
              <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <Loader2 size={12} className="animate-spin" />
                Running pipeline…
              </span>
            )}
            {hasRun && !isRunning && (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                ✓ Pipeline complete
              </span>
            )}

            {/* Icon actions */}
            <div className="flex items-center gap-1">
              <ActionIconButton
                label={isExporting ? "Exporting…" : "Save as PDF"}
                onClick={handleExportPdf}
                disabled={isExporting}
              >
                {isExporting
                  ? <Loader2 size={18} className="text-neutral-400 animate-spin" />
                  : <FileDown size={18} className="text-neutral-400" />}
              </ActionIconButton>
              <ActionIconButton label="Share" onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: idea?.title ?? "Idea", url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.info("Link copied to clipboard");
                }
              }}>
                <Share2 size={18} className="text-neutral-400" />
              </ActionIconButton>
            </div>

            {/* Edit with AI / Run */}
            <button
              type="button"
              onClick={runPipeline}
              disabled={isRunning}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer transition-opacity",
                "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-[0_2px_16px_rgba(255,183,3,0.3)] outline outline-[0.66px] outline-yellow-500/60",
                isRunning && "opacity-60 cursor-not-allowed"
              )}
            >
              {isRunning
                ? <Loader2 size={14} className="animate-spin" />
                : <Sparkles size={14} />}
              {hasRun ? "Re-run AI" : "Edit with AI"}
            </button>
          </div>
        </div>

        {runError && (
          <p className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {runError}
          </p>
        )}

        {/* Tab bar */}
        <div className="px-2 py-1.5 bg-gray-200 dark:bg-neutral-800 rounded-lg flex items-center justify-between gap-1 overflow-x-auto mb-8 scrollbar-hide">
          {TABS.map(({ key, label }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={cn(
                  "shrink-0 min-h-10 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap",
                  active
                    ? "bg-white dark:bg-neutral-700 text-foreground shadow-sm border border-neutral-300 dark:border-neutral-600"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-white/50 dark:hover:bg-neutral-700/50"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <TabContent
          tab={activeTab}
          idea={idea}
          sections={sections}
          hasRun={hasRun}
          onRun={runPipeline}
          isRunning={isRunning}
          onRefreshSection={fetchSection}
        />
      </main>
    </div>
  );
}

function ActionIconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {children}
      </button>
      <span className="text-[8px] font-medium text-neutral-400 leading-6">{label}</span>
    </div>
  );
}

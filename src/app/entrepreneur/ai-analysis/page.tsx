"use client";

import { useState } from "react";
import {
  Home, ChevronRight, Play, Loader2,
  Users, Swords, BarChart2, Lightbulb, Briefcase,
  ListChecks, Rocket, DollarSign, Megaphone, AlertTriangle, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAiPipeline, type SectionKey } from "@/features/entrepreneur/hooks/useAiPipeline";
import { CustomersSection }       from "@/features/entrepreneur/components/analysis/CustomersSection";
import { CompetitionSection }     from "@/features/entrepreneur/components/analysis/CompetitionSection";
import { MarketPotentialSection } from "@/features/entrepreneur/components/analysis/MarketPotentialSection";
import { IdeaStrategySection }    from "@/features/entrepreneur/components/analysis/IdeaStrategySection";
import { BusinessModelSection }   from "@/features/entrepreneur/components/analysis/BusinessModelSection";
import { FunctionsListSection }   from "@/features/entrepreneur/components/analysis/FunctionsListSection";
import { MvpPlanningSection }     from "@/features/entrepreneur/components/analysis/MvpPlanningSection";
import { UnitEconomicsSection }   from "@/features/entrepreneur/components/analysis/UnitEconomicsSection";
import { GoToMarketSection }      from "@/features/entrepreneur/components/analysis/GoToMarketSection";
import { ProblemsSection }        from "@/features/entrepreneur/components/analysis/ProblemsSection";
import { GeneratedIdeaSection }   from "@/features/entrepreneur/components/analysis/GeneratedIdeaSection";

// ─── Nav config ───────────────────────────────────────────────────────────────

interface NavItem {
  key: SectionKey;
  label: string;
  Icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { key: "customers",       label: "Customers",        Icon: Users          },
  { key: "competition",     label: "Competition",      Icon: Swords         },
  { key: "marketPotential", label: "Market Potential", Icon: BarChart2      },
  { key: "ideaStrategy",    label: "Idea Strategy",    Icon: Lightbulb      },
  { key: "businessModel",   label: "Business Model",   Icon: Briefcase      },
  { key: "functionsList",   label: "Functions List",   Icon: ListChecks     },
  { key: "mvpPlanning",     label: "MVP Planning",     Icon: Rocket         },
  { key: "unitEconomics",   label: "Unit Economics",   Icon: DollarSign     },
  { key: "goToMarket",      label: "Go-to-Market",     Icon: Megaphone      },
  { key: "problems",        label: "Problems",         Icon: AlertTriangle  },
  { key: "idea",            label: "Generated Idea",   Icon: Sparkles       },
];

// ─── Section renderer ─────────────────────────────────────────────────────────

function SectionContent({ sectionKey, sections }: { sectionKey: SectionKey; sections: ReturnType<typeof useAiPipeline>["sections"] }) {
  const s = sections[sectionKey];
  switch (sectionKey) {
    case "customers":       return <CustomersSection       {...s} />;
    case "competition":     return <CompetitionSection     {...s} />;
    case "marketPotential": return <MarketPotentialSection {...s} />;
    case "ideaStrategy":    return <IdeaStrategySection    {...s} />;
    case "businessModel":   return <BusinessModelSection   {...s} />;
    case "functionsList":   return <FunctionsListSection   {...s} />;
    case "mvpPlanning":     return <MvpPlanningSection     {...s} />;
    case "unitEconomics":   return <UnitEconomicsSection   {...s} />;
    case "goToMarket":      return <GoToMarketSection      {...s} />;
    case "problems":        return <ProblemsSection        {...s} />;
    case "idea":            return <GeneratedIdeaSection   {...s} />;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AiAnalysisPage() {
  const { sections, isRunning, hasRun, runError, runPipeline } = useAiPipeline();
  const [activeSection, setActiveSection] = useState<SectionKey>("customers");

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors flex flex-col">
      {/* Breadcrumb */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-3">
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/entrepreneur" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer">
            <Home size={14} />
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200 font-medium">AI Analysis</span>
        </nav>
      </div>

      {/* Top bar */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-white">
              AI Analysis
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              AI-powered insights for your idea and business model
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Pipeline status */}
            {isRunning && (
              <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <Loader2 size={13} className="animate-spin" />
                Running pipeline…
              </span>
            )}
            {hasRun && !isRunning && (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                ✓ Pipeline complete
              </span>
            )}

            {/* Run button */}
            <button
              type="button"
              onClick={runPipeline}
              disabled={isRunning}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity cursor-pointer",
                "bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_12px_rgba(255,183,3,0.3)]",
                isRunning && "opacity-60 cursor-not-allowed"
              )}
            >
              {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              Run Pipeline
            </button>
          </div>
        </div>

        {runError && (
          <p className="mt-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
            {runError}
          </p>
        )}
      </div>

      {/* Body: sidebar + content */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex gap-5 min-h-0">
        {/* Left nav */}
        <aside className="hidden md:flex flex-col w-48 shrink-0 gap-1">
          {NAV_ITEMS.map(({ key, label, Icon }) => {
            const s = sections[key];
            const active = activeSection === key;
            const hasData = !!s.data;
            const hasError = !!s.error;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSection(key)}
                className={cn(
                  "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm text-left transition-colors cursor-pointer",
                  active
                    ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-neutral-200 dark:hover:bg-neutral-700/50"
                )}
              >
                <Icon
                  size={15}
                  className={cn(
                    "shrink-0",
                    active
                      ? "text-cyan-600 dark:text-cyan-400"
                      : hasError
                      ? "text-red-400"
                      : hasData
                      ? "text-green-500"
                      : "text-gray-400 dark:text-gray-500"
                  )}
                />
                <span className="truncate">{label}</span>
                {s.isLoading && (
                  <Loader2 size={11} className="ml-auto shrink-0 animate-spin text-amber-400" />
                )}
              </button>
            );
          })}
        </aside>

        {/* Mobile section select */}
        <div className="md:hidden w-full mb-3">
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value as SectionKey)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 outline-none"
          >
            {NAV_ITEMS.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {!hasRun && !sections[activeSection].data && !sections[activeSection].isLoading ? (
            <PipelineCallToAction onRun={runPipeline} isRunning={isRunning} />
          ) : (
            <SectionContent sectionKey={activeSection} sections={sections} />
          )}
        </div>
      </div>
    </div>
  );
}

function PipelineCallToAction({ onRun, isRunning }: { onRun: () => void; isRunning: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-80 gap-5 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
      <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-[0_4px_16px_rgba(255,183,3,0.3)]">
        <Sparkles size={24} className="text-white" />
      </div>
      <div className="text-center space-y-2 px-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          No analysis yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Run the AI pipeline to generate in-depth insights about your customers, competition, market potential, and more.
        </p>
      </div>
      <button
        type="button"
        onClick={onRun}
        disabled={isRunning}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer transition-opacity",
          "bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_12px_rgba(255,183,3,0.3)]",
          isRunning && "opacity-60 cursor-not-allowed"
        )}
      >
        {isRunning ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
        {isRunning ? "Running…" : "Run Pipeline"}
      </button>
    </div>
  );
}

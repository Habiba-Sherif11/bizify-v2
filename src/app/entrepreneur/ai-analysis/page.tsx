"use client";

import { useState } from "react";
import {
  Home, ChevronRight, Play, Loader2,
  Users, Swords, BarChart2, Lightbulb, Briefcase,
  ListChecks, Rocket, DollarSign, Megaphone, AlertTriangle, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef } from "react";
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

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const navItemVariant = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

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

// ─── Scroll-triggered fade wrapper ───────────────────────────────────────────

function FadeInView({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AiAnalysisPage() {
  const { sections, isRunning, hasRun, runError, runPipeline } = useAiPipeline();
  const [activeSection, setActiveSection] = useState<SectionKey>("customers");

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors flex flex-col">
      {/* Breadcrumb */}
      <motion.div
        className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-3"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <motion.span whileHover={{ scale: 1.15 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
            <Link href="/entrepreneur" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer">
              <Home size={14} />
            </Link>
          </motion.span>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200 font-medium">AI Analysis</span>
        </nav>
      </motion.div>

      {/* Top bar */}
      <motion.div
        className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-4"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.08 }}
      >
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
            <AnimatePresence mode="wait">
              {isRunning && (
                <motion.span
                  key="running"
                  className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Loader2 size={13} className="animate-spin" />
                  Running pipeline…
                </motion.span>
              )}
              {hasRun && !isRunning && (
                <motion.span
                  key="done"
                  className="text-xs text-green-600 dark:text-green-400 font-medium"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  ✓ Pipeline complete
                </motion.span>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={runPipeline}
              disabled={isRunning}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer",
                "bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_12px_rgba(255,183,3,0.3)]",
                isRunning && "opacity-60 cursor-not-allowed"
              )}
              whileHover={isRunning ? {} : { scale: 1.04, boxShadow: "0 4px 20px rgba(255,183,3,0.45)" }}
              whileTap={isRunning ? {} : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              Run Pipeline
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {runError && (
            <motion.p
              className="mt-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {runError}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Body: sidebar + content */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex gap-5 min-h-0">
        {/* Left nav */}
        <motion.aside
          className="hidden md:flex flex-col w-48 shrink-0 gap-1"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {NAV_ITEMS.map(({ key, label, Icon }) => {
            const s = sections[key];
            const active = activeSection === key;
            const hasData = !!s.data;
            const hasError = !!s.error;
            return (
              <motion.button
                key={key}
                type="button"
                onClick={() => setActiveSection(key)}
                variants={navItemVariant}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
              </motion.button>
            );
          })}
        </motion.aside>

        {/* Mobile section select */}
        <motion.div
          className="md:hidden w-full mb-3"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15 }}
        >
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value as SectionKey)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 outline-none"
          >
            {NAV_ITEMS.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {!hasRun && !sections[activeSection].data && !sections[activeSection].isLoading ? (
              <motion.div
                key="cta"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <PipelineCallToAction onRun={runPipeline} isRunning={isRunning} />
              </motion.div>
            ) : (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <SectionContent sectionKey={activeSection} sections={sections} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PipelineCallToAction({ onRun, isRunning }: { onRun: () => void; isRunning: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <motion.div
      ref={ref}
      className="flex flex-col items-center justify-center h-80 gap-5 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
    >
      <motion.div
        variants={fadeUp}
        whileHover={{ scale: 1.08, rotate: 4 }}
        transition={{ type: "spring", stiffness: 350, damping: 18 }}
        className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-500 to-yellow-400 flex items-center justify-center shadow-[0_4px_16px_rgba(255,183,3,0.3)]"
      >
        <Sparkles size={24} className="text-white" />
      </motion.div>

      <motion.div variants={fadeUp} className="text-center space-y-2 px-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          No analysis yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Run the AI pipeline to generate in-depth insights about your customers, competition, market potential, and more.
        </p>
      </motion.div>

      <motion.button
        variants={fadeUp}
        type="button"
        onClick={onRun}
        disabled={isRunning}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer",
          "bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_12px_rgba(255,183,3,0.3)]",
          isRunning && "opacity-60 cursor-not-allowed"
        )}
        whileHover={isRunning ? {} : { scale: 1.05, boxShadow: "0 4px_20px rgba(255,183,3,0.45)" }}
        whileTap={isRunning ? {} : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {isRunning ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
        {isRunning ? "Running…" : "Run Pipeline"}
      </motion.button>
    </motion.div>
  );
}

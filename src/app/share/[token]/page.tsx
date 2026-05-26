import { notFound } from "next/navigation";
import Link from "next/link";
import { Lightbulb, DollarSign, Zap, Tag } from "lucide-react";
import SVGComponent from "@/components/sections/logo";

import { ProblemsSection }        from "@/features/entrepreneur/components/analysis/ProblemsSection";
import { CustomersSection }       from "@/features/entrepreneur/components/analysis/CustomersSection";
import { CompetitionSection }     from "@/features/entrepreneur/components/analysis/CompetitionSection";
import { MarketPotentialSection } from "@/features/entrepreneur/components/analysis/MarketPotentialSection";
import { IdeaStrategySection }    from "@/features/entrepreneur/components/analysis/IdeaStrategySection";
import { BusinessModelSection }   from "@/features/entrepreneur/components/analysis/BusinessModelSection";
import { FunctionsListSection }   from "@/features/entrepreneur/components/analysis/FunctionsListSection";
import { MvpPlanningSection }     from "@/features/entrepreneur/components/analysis/MvpPlanningSection";
import { UnitEconomicsSection }   from "@/features/entrepreneur/components/analysis/UnitEconomicsSection";
import { GoToMarketSection }      from "@/features/entrepreneur/components/analysis/GoToMarketSection";

interface SharedIdea {
  id: string;
  title: string;
  description: string | null;
  status: string;
  budget: number | null;
  skills: unknown;
  feasibility: number | null;
  created_at: string;
  // AI analysis sections
  problems?: unknown;
  customers?: unknown;
  competition?: unknown;
  market_potential?: unknown;
  idea_strategy?: unknown;
  business_model?: unknown;
  functions_list?: unknown;
  mvp_planning?: unknown;
  unit_economics?: unknown;
  go_to_market?: unknown;
}

async function fetchSharedIdea(token: string): Promise<SharedIdea | null> {
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/v1/share/${token}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function flattenSkills(skills: unknown): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.filter((s): s is string => typeof s === "string");
  if (typeof skills === "object" && skills !== null) {
    const s = skills as Record<string, unknown>;
    return [
      ...((s.your_skills as string[]) ?? []),
      ...((s.required_skills as string[]) ?? []),
      ...((s.skill_gaps as string[]) ?? []),
    ].filter((v): v is string => typeof v === "string");
  }
  return [];
}

function toSectionData(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

export default async function SharedIdeaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const idea = await fetchSharedIdea(token);

  if (!idea) notFound();

  const skills = flattenSkills(idea.skills);
  const createdDate = new Date(idea.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const sections = {
    problems:      toSectionData(idea.problems),
    customers:     toSectionData(idea.customers),
    competition:   toSectionData(idea.competition),
    market:        toSectionData(idea.market_potential),
    strategy:      toSectionData(idea.idea_strategy),
    businessModel: toSectionData(idea.business_model),
    functions:     toSectionData(idea.functions_list),
    mvp:           toSectionData(idea.mvp_planning),
    financial:     toSectionData(idea.unit_economics),
    goToMarket:    toSectionData(idea.go_to_market),
  };

  const hasAnalysis = Object.values(sections).some(Boolean);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      {/* Top bar */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <SVGComponent className="h-6 w-auto" />
            <span className="font-bold text-neutral-900 dark:text-white text-lg tracking-tight"
              style={{ fontFamily: "var(--font-cormorant-sc)" }}>
              Bizify
            </span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Sign in to Bizify →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Header card */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center shrink-0">
              <Lightbulb size={20} className="text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-1">Shared idea · {createdDate}</p>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white leading-tight">
                {idea.title}
              </h1>
              <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 capitalize">
                {idea.status.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {idea.description && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
              Description
            </h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
              {idea.description}
            </p>
          </div>
        )}

        {/* Metrics */}
        {(idea.budget !== null || idea.feasibility !== null) && (
          <div className="grid grid-cols-2 gap-4">
            {idea.budget !== null && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">Budget</p>
                  <p className="text-base font-semibold text-neutral-800 dark:text-white">
                    ${idea.budget.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            {idea.feasibility !== null && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Zap size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">Feasibility</p>
                  <p className="text-base font-semibold text-neutral-800 dark:text-white">
                    {idea.feasibility.toFixed(1)} / 10
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={14} className="text-neutral-400" />
              <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                Skills
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Analysis Sections */}
        {hasAnalysis && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
              <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                AI Analysis
              </span>
              <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
            </div>

            {sections.problems && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <ProblemsSection data={sections.problems} isLoading={false} error={null} />
              </div>
            )}

            {sections.customers && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <CustomersSection data={sections.customers} isLoading={false} error={null} />
              </div>
            )}

            {sections.competition && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <CompetitionSection data={sections.competition} isLoading={false} error={null} />
              </div>
            )}

            {sections.market && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <MarketPotentialSection data={sections.market} isLoading={false} error={null} />
              </div>
            )}

            {sections.strategy && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <IdeaStrategySection data={sections.strategy} isLoading={false} error={null} />
              </div>
            )}

            {sections.businessModel && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <BusinessModelSection data={sections.businessModel} isLoading={false} error={null} />
              </div>
            )}

            {sections.functions && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <FunctionsListSection data={sections.functions} isLoading={false} error={null} />
              </div>
            )}

            {sections.mvp && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <MvpPlanningSection data={sections.mvp} isLoading={false} error={null} />
              </div>
            )}

            {sections.financial && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <UnitEconomicsSection data={sections.financial} isLoading={false} error={null} />
              </div>
            )}

            {sections.goToMarket && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                <GoToMarketSection data={sections.goToMarket} isLoading={false} error={null} />
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="text-center py-6">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            Want to build your own business ideas with AI analysis?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-400 transition-colors"
          >
            Get started with Bizify
          </Link>
        </div>
      </main>
    </div>
  );
}

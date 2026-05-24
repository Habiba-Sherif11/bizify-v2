"use client";

import { useState, useEffect } from "react";
import {
  Home, ChevronRight, Search, Lightbulb,
  Plus, LayoutList, Heart, Archive, Share2, GitCompare, Loader2,
} from "lucide-react";
import Link from "next/link";
import { IdeaCard, type IdeaCardProps } from "@/features/entrepreneur/components/IdeaCard";
import { Select, type SelectOption } from "@/components/ui/select";
import { CreateIdeaModal } from "@/features/entrepreneur/components/CreateIdeaModal";
import { ArchivedIdeasDrawer } from "@/features/entrepreneur/components/ArchivedIdeasDrawer";
import { useIdeas, formatIdeaDate } from "@/features/entrepreneur/hooks/useIdeas";
import type { Idea } from "@/features/entrepreneur/types/idea";

// ─── Filter options ───────────────────────────────────────────────────────────

const toOptions = (arr: string[]): SelectOption[] =>
  arr.map((v) => ({ value: v, label: v }));

const BUDGETS = ["All Budgets", "Low (< $10k)", "Medium ($10k–$50k)", "High (> $50k)"];
const FEASIBILITY = ["All Feasibility", "High (8–10)", "Medium (4–7)", "Low (0–3)"];
const SORT_OPTIONS = [
  { value: "created_at_desc", label: "Newest first" },
  { value: "created_at_asc",  label: "Oldest first" },
  { value: "title_asc",       label: "A → Z" },
  { value: "title_desc",      label: "Z → A" },
];

// ─── Budget range helpers ─────────────────────────────────────────────────────

function budgetToRange(label: string): { min?: number; max?: number } {
  if (label === "Low (< $10k)")         return { max: 10_000 };
  if (label === "Medium ($10k–$50k)")   return { min: 10_000, max: 50_000 };
  if (label === "High (> $50k)")        return { min: 50_000 };
  return {};
}

function feasibilityToRange(label: string): number | undefined {
  if (label === "High (8–10)")   return 8;
  if (label === "Medium (4–7)")  return 4;
  if (label === "Low (0–3)")     return 0;
  return undefined;
}

// ─── Map backend Idea → IdeaCardProps ────────────────────────────────────────

function skillToString(skill: Record<string, unknown>): string {
  if (typeof skill.name === "string") return skill.name;
  const values = Object.values(skill).filter((v) => typeof v === "string");
  return (values[0] as string) ?? "";
}

function flattenSkills(skills: Idea["skills"]): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.map(skillToString).filter(Boolean);
  // SkillsGap dict format: show gap skills first, then required
  const gap = (skills as { skill_gaps?: string[]; your_skills?: string[]; required_skills?: string[] });
  return [
    ...(gap.skill_gaps      ?? []),
    ...(gap.required_skills ?? []),
    ...(gap.your_skills     ?? []),
  ].filter((s): s is string => typeof s === "string");
}

function toCardProps(idea: Idea): IdeaCardProps {
  return {
    id: idea.id,
    title: idea.title ?? "Untitled idea",
    date: formatIdeaDate(idea.created_at),
    status: (idea.status ?? "draft").toUpperCase(),
    description: idea.description ?? "",
    skills: flattenSkills(idea.skills),
  };
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type IdeaTab = "all" | "favorites" | "archive" | "share" | "compare";

const TABS: { id: IdeaTab; label: string; Icon: React.ElementType }[] = [
  { id: "all",       label: "All Ideas",  Icon: LayoutList },
  { id: "favorites", label: "Favorites",  Icon: Heart      },
  { id: "archive",   label: "Archive",    Icon: Archive    },
  { id: "share",     label: "Share",      Icon: Share2     },
  { id: "compare",   label: "Compare",    Icon: GitCompare },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IdeasPage() {
  const {
    ideas, archivedIdeas, isLoading, isArchiveLoading,
    fetchIdeas, fetchArchivedIdeas, createIdea, archiveIdea, unarchiveIdea,
  } = useIdeas();

  const [activeTab, setActiveTab]     = useState<IdeaTab>("all");
  const [search, setSearch]           = useState("");
  const [budget, setBudget]           = useState(BUDGETS[0]);
  const [feasibility, setFeasibility] = useState(FEASIBILITY[0]);
  const [sort, setSort]               = useState(SORT_OPTIONS[0].value);
  const [showCreate, setShowCreate]   = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  // Load ideas whenever filters change
  useEffect(() => {
    const parts = sort.split("_");
    const sort_order = parts.pop() as "asc" | "desc";
    const sort_by = parts.join("_");
    const budgetRange = budgetToRange(budget);
    fetchIdeas({
      min_budget: budgetRange.min,
      max_budget: budgetRange.max,
      feasibility: feasibilityToRange(feasibility),
      sort_by,
      sort_order,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, budget, feasibility]);

  const handleArchiveTabOpen = () => {
    setActiveTab("archive");
    setShowArchive(true);
    fetchArchivedIdeas();
  };

  const handleTabClick = (id: IdeaTab) => {
    if (id === "archive") {
      handleArchiveTabOpen();
    } else {
      setActiveTab(id);
    }
  };

  // Client-side search filter (on top of server-side budget/feasibility)
  const filtered = ideas.filter((idea) => {
    const q = search.toLowerCase();
    return (
      (idea.title ?? "").toLowerCase().includes(q) ||
      (idea.description ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 pt-6 text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/entrepreneur"
            className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            <Home size={14} />
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200 font-medium">Ideas</span>
        </nav>

        {/* Page header */}
        <div className="mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-white shrink-0">
            Ideas
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
            {/* Tabs */}
            <div className="flex items-center gap-1">
              {TABS.map(({ id, label, Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleTabClick(id)}
                    className="flex flex-col items-center gap-0 p-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className={`w-6 h-6 flex items-center justify-center ${active ? "text-cyan-600 dark:text-cyan-400" : "text-neutral-400 dark:text-neutral-500"}`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-[8px] font-medium leading-6 ${active ? "text-cyan-600 dark:text-cyan-400" : "text-neutral-400 dark:text-neutral-500"}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Create button */}
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_16px_rgba(255,183,3,0.3)] outline outline-[0.66px] outline-yellow-500/60 cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} />
              Create new Idea
            </button>
          </div>
        </div>

        {/* Toolbar (only on All Ideas tab) */}
        {activeTab === "all" && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
            <div className="relative w-full sm:w-72 shrink-0">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ideas…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-background dark:bg-neutral-800 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:focus:border-cyan-500 transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-3 sm:flex-nowrap">
              <Select value={budget}      onChange={setBudget}      options={toOptions(BUDGETS)}      className="w-48" />
              <Select value={feasibility} onChange={setFeasibility} options={toOptions(FEASIBILITY)}  className="w-44" />
              <Select
                value={sort}
                onChange={setSort}
                options={SORT_OPTIONS}
                className="w-40"
              />
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === "all" ? (
          isLoading ? (
            <div className="flex items-center justify-center pt-24">
              <Loader2 size={28} className="animate-spin text-cyan-500" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filtered.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  {...toCardProps(idea)}
                  onDelete={() => archiveIdea(idea.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Lightbulb size={22} />}
              message="No ideas found"
              hint="Adjust your filters or create a new idea"
            />
          )
        ) : activeTab !== "archive" ? (
          <EmptyState
            icon={<Lightbulb size={22} />}
            message={`${TABS.find((t) => t.id === activeTab)?.label} coming soon`}
            hint="This feature is under development"
          />
        ) : null}
      </main>

      {/* Modals */}
      {showCreate && (
        <CreateIdeaModal onClose={() => setShowCreate(false)} onCreate={(payload) => createIdea(payload).then(() => {})} />
      )}

      {showArchive && (
        <ArchivedIdeasDrawer
          ideas={archivedIdeas}
          isLoading={isArchiveLoading}
          onClose={() => { setShowArchive(false); setActiveTab("all"); }}
          onUnarchive={unarchiveIdea}
        />
      )}
    </div>
  );
}

function EmptyState({ icon, message, hint }: { icon: React.ReactNode; message: string; hint: string }) {
  return (
    <div className="mt-24 flex flex-col items-center gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-400 dark:text-neutral-500">
        {icon}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>
    </div>
  );
}

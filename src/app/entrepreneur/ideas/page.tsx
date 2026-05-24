"use client";

import { useState, useEffect } from "react";
import {
  Home, ChevronRight, Search, Lightbulb,
  Plus, LayoutList, Heart, Archive, Share2, GitCompare, Loader2,
  X, Send, GitFork,
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

// ─── Budget / feasibility helpers ────────────────────────────────────────────

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

const SELECTION_MODES: IdeaTab[] = ["share", "compare"];

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

  // Favourites — local state until backend supports it
  // Backend needed: PATCH /ideas/:id/favorite (toggle) + GET /ideas?favorited=true
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  // Selection mode (share / compare)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelectionMode = SELECTION_MODES.includes(activeTab);

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

  // Clear selection when leaving selection mode
  useEffect(() => {
    if (!isSelectionMode) setSelectedIds(new Set());
  }, [isSelectionMode]);

  const handleTabClick = (id: IdeaTab) => {
    if (id === "archive") {
      setActiveTab("archive");
      setShowArchive(true);
      fetchArchivedIdeas();
    } else {
      setActiveTab(id);
    }
  };

  const toggleFavorite = (id: string) => {
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const exitSelectionMode = () => {
    setActiveTab("all");
    setSelectedIds(new Set());
  };

  // Client-side search + favorites filter
  const filtered = ideas.filter((idea) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (idea.title ?? "").toLowerCase().includes(q) ||
      (idea.description ?? "").toLowerCase().includes(q);
    const matchesFav = activeTab === "favorites" ? favoritedIds.has(idea.id) : true;
    return matchesSearch && matchesFav;
  });

  const compareLimit = 3;
  const canCompare = activeTab === "compare" && selectedIds.size >= 2 && selectedIds.size <= compareLimit;
  const canShare   = activeTab === "share"   && selectedIds.size >= 1;

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
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

        {/* Selection mode banner */}
        {isSelectionMode && (
          <div className="mt-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
            <div className="flex-1 text-sm text-cyan-800 dark:text-cyan-200">
              {activeTab === "compare"
                ? `Select 2–${compareLimit} ideas to compare. ${selectedIds.size} selected.`
                : `Select the ideas you want to share. ${selectedIds.size} selected.`}
            </div>
            <button
              type="button"
              onClick={exitSelectionMode}
              className="flex items-center gap-1.5 text-xs text-cyan-700 dark:text-cyan-300 hover:text-cyan-900 dark:hover:text-cyan-100 transition-colors cursor-pointer"
            >
              <X size={13} /> Cancel
            </button>
          </div>
        )}

        {/* Toolbar (only on All / Favorites tab) */}
        {(activeTab === "all" || activeTab === "favorites") && (
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
            {activeTab === "all" && (
              <div className="flex flex-wrap gap-3 sm:flex-nowrap">
                <Select value={budget}      onChange={setBudget}      options={toOptions(BUDGETS)}      className="w-48" />
                <Select value={feasibility} onChange={setFeasibility} options={toOptions(FEASIBILITY)}  className="w-44" />
                <Select value={sort}        onChange={setSort}        options={SORT_OPTIONS}             className="w-40" />
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {(activeTab === "all" || activeTab === "favorites" || isSelectionMode) ? (
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
                  isFavorited={favoritedIds.has(idea.id)}
                  onToggleFavorite={() => toggleFavorite(idea.id)}
                  onDelete={() => archiveIdea(idea.id)}
                  isSelectable={isSelectionMode}
                  isSelected={selectedIds.has(idea.id)}
                  onSelect={() => toggleSelect(idea.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={activeTab === "favorites" ? <Heart size={22} /> : <Lightbulb size={22} />}
              message={activeTab === "favorites" ? "No favourites yet" : "No ideas found"}
              hint={activeTab === "favorites" ? "Heart an idea to save it here" : "Adjust your filters or create a new idea"}
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

      {/* Floating action bar — selection mode */}
      {isSelectionMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-900 dark:bg-neutral-950 border border-neutral-700 shadow-2xl">
            <span className="text-sm text-neutral-300 whitespace-nowrap">
              {selectedIds.size} {selectedIds.size === 1 ? "idea" : "ideas"} selected
            </span>
            <div className="w-px h-4 bg-neutral-700" />

            {activeTab === "compare" ? (
              <button
                type="button"
                disabled={!canCompare}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium bg-cyan-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan-400 transition-colors cursor-pointer"
                onClick={() => {
                  // TODO: pass selectedIds to compare endpoint
                  // Backend: POST /ideas/compare { idea_ids: string[] }
                  alert(`Compare: ${[...selectedIds].join(", ")}`);
                }}
              >
                <GitFork size={14} />
                Compare ideas
              </button>
            ) : (
              <button
                type="button"
                disabled={!canShare}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium bg-cyan-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan-400 transition-colors cursor-pointer"
                onClick={() => {
                  // TODO: pass selectedIds to share endpoint
                  // Backend: POST /ideas/share { idea_ids: string[] } → returns share link
                  alert(`Share: ${[...selectedIds].join(", ")}`);
                }}
              >
                <Send size={14} />
                Share ideas
              </button>
            )}

            <button
              type="button"
              onClick={exitSelectionMode}
              className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>
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

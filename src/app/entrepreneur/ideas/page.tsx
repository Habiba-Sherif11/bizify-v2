"use client";

import { useState } from "react";
import {
  Home, ChevronRight, Search, Lightbulb,
  Plus, LayoutList, Heart, Archive, Share2, GitCompare,
} from "lucide-react";
import Link from "next/link";
import { IdeaCard, type IdeaCardProps } from "@/features/entrepreneur/components/IdeaCard";
import { Select, type SelectOption } from "@/components/ui/select";

// ─── Static data ────────────────────────────────────────────────────────────

const IDEAS: IdeaCardProps[] = [
  {
    id: "1",
    title: "Cafe Noir",
    date: "January 9, 2024",
    status: "verified",
    description:
      "A specialty coffee subscription service delivering curated single-origin beans with personalized tasting notes.",
    category: "Ecommerce",
    categoryColor: "bg-yellow-500",
  },
  {
    id: "2",
    title: "SaaS Analytics Pro",
    date: "January 9, 2024",
    status: "unverified",
    description:
      "Unified analytics dashboard for SaaS businesses to track churn, MRR, and user behavior in real time.",
    category: "SaaS",
    categoryColor: "bg-blue-500",
  },
  {
    id: "3",
    title: "FinTrack Pro",
    date: "January 9, 2024",
    status: "in-review",
    description:
      "AI-powered personal finance tracker that categorizes spending, forecasts budgets, and suggests savings goals.",
    category: "Fintech",
    categoryColor: "bg-indigo-600",
  },
  {
    id: "4",
    title: "EduLearn Platform",
    date: "March 5, 2024",
    status: "in-review",
    description:
      "Adaptive learning platform for K-12 students using AI to personalize curriculum paths and track progress.",
    category: "Ecommerce",
    categoryColor: "bg-pink-800",
  },
  {
    id: "5",
    title: "HealthSync App",
    date: "April 18, 2024",
    status: "unverified",
    description:
      "Wearable-integrated health monitoring app that tracks vitals, sleep quality, and daily fitness goals.",
    category: "HealthTech",
    categoryColor: "bg-violet-400",
  },
  {
    id: "6",
    title: "AgriTech Hub",
    date: "May 30, 2024",
    status: "verified",
    description:
      "Smart farming platform connecting smallholder farmers with precision agriculture tools and market insights.",
    category: "Fintech",
    categoryColor: "bg-cyan-600",
  },
];

const toOptions = (arr: string[]): SelectOption[] =>
  arr.map((v) => ({ value: v, label: v }));

const CATEGORIES  = ["All Categories", "Ecommerce", "SaaS", "Fintech", "HealthTech"];
const BUDGETS     = ["All Budgets", "Low (< $10k)", "Medium ($10k–$50k)", "High (> $50k)"];
const FEASIBILITY = ["All Feasibility", "High", "Medium", "Low"];

// ─── Tabs ────────────────────────────────────────────────────────────────────

type IdeaTab = "all" | "favorites" | "archive" | "share" | "compare";

const TABS: { id: IdeaTab; label: string; Icon: React.ElementType }[] = [
  { id: "all",       label: "All Ideas",  Icon: LayoutList },
  { id: "favorites", label: "Favorites",  Icon: Heart      },
  { id: "archive",   label: "Archive",    Icon: Archive    },
  { id: "share",     label: "Share",      Icon: Share2     },
  { id: "compare",   label: "Compare",    Icon: GitCompare },
];


// ─── Page ────────────────────────────────────────────────────────────────────

export default function IdeasPage() {
  const [activeTab, setActiveTab]     = useState<IdeaTab>("all");
  const [search, setSearch]           = useState("");
  const [category, setCategory]       = useState(CATEGORIES[0]);
  const [budget, setBudget]           = useState(BUDGETS[0]);
  const [feasibility, setFeasibility] = useState(FEASIBILITY[0]);

  const filtered = IDEAS.filter((idea) => {
    const matchSearch =
      idea.title.toLowerCase().includes(search.toLowerCase()) ||
      idea.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      category === CATEGORIES[0] || idea.category === category;
    return matchSearch && matchCategory;
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

        {/* Page header: title + tabs + create button */}
        <div className="mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-white shrink-0">
            Ideas
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
            {/* Icon tabs */}
            <div className="flex items-center gap-1">
              {TABS.map(({ id, label, Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
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
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_16px_rgba(255,183,3,0.3)] outline outline-[0.66px] outline-yellow-500/60 cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} />
              Create new Idea
            </button>
          </div>
        </div>

        {/* Toolbar (only shown on All Ideas tab) */}
        {activeTab === "all" && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
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
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-cyan-400 dark:focus:border-cyan-500 transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-3 sm:flex-nowrap">
              <Select value={category}    onChange={setCategory}    options={toOptions(CATEGORIES)}  className="w-44" />
              <Select value={budget}      onChange={setBudget}      options={toOptions(BUDGETS)}      className="w-48" />
              <Select value={feasibility} onChange={setFeasibility} options={toOptions(FEASIBILITY)}  className="w-40" />
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === "all" ? (
          filtered.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filtered.map((idea) => (
                <IdeaCard key={idea.id} {...idea} />
              ))}
            </div>
          ) : (
            <EmptyState icon={<Lightbulb size={22} />} message="No ideas found" hint="Adjust your filters or search term" />
          )
        ) : (
          <EmptyState icon={<Lightbulb size={22} />} message={`${TABS.find(t => t.id === activeTab)?.label} coming soon`} hint="This feature is under development" />
        )}
      </main>
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

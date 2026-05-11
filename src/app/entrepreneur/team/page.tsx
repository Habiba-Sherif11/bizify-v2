"use client";

import { useState } from "react";
import { Home, ChevronRight, Search, Plus, Users } from "lucide-react";
import Link from "next/link";
import { TeamCard, type TeamCardProps } from "@/features/entrepreneur/components/TeamCard";

// ─── Static data ────────────────────────────────────────────────────────────

const TEAMS: TeamCardProps[] = [
  {
    id: "1",
    name: "GrowthLab Team",
    date: "January 9, 2024",
    description:
      "Helping early-stage founders validate ideas, research markets, and build scalable digital products.",
    members: [{ id: "a", name: "Alice" }, { id: "b", name: "Bob" }],
    overflowCount: 3,
    overflowColor: "amber",
  },
  {
    id: "2",
    name: "DevForge Studio",
    date: "March 15, 2024",
    description:
      "A team of engineers and designers building next-generation tools for modern software development workflows.",
    members: [{ id: "c", name: "Carlos" }, { id: "d", name: "Diana" }],
    overflowCount: 7,
    overflowColor: "cyan",
  },
  {
    id: "3",
    name: "BizSpark Collective",
    date: "February 28, 2024",
    description:
      "Connecting entrepreneurs with the resources, mentors, and capital they need to grow their ventures.",
    members: [{ id: "e", name: "Eva" }, { id: "f", name: "Frank" }],
    overflowCount: 7,
    overflowColor: "cyan",
  },
  {
    id: "4",
    name: "DesignCo Agency",
    date: "April 3, 2024",
    description:
      "A creative team focused on brand identity, UX design, and end-to-end digital product development.",
    members: [{ id: "g", name: "Grace" }, { id: "h", name: "Hank" }],
    overflowCount: 3,
    overflowColor: "amber",
  },
  {
    id: "5",
    name: "ScaleUp Ventures",
    date: "May 20, 2024",
    description:
      "Investment and advisory team helping Series A startups optimize operations for rapid market scale.",
    members: [{ id: "i", name: "Ivan" }, { id: "j", name: "Julia" }],
    overflowCount: 7,
    overflowColor: "cyan",
  },
  {
    id: "6",
    name: "LaunchPad Hub",
    date: "June 12, 2024",
    description:
      "Community-driven startup incubator offering workspace, mentorship, and funding access to founders.",
    members: [{ id: "k", name: "Kevin" }, { id: "l", name: "Laura" }],
    overflowCount: 7,
    overflowColor: "cyan",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TeamsPage() {
  const [search, setSearch] = useState("");

  const filtered = TEAMS.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  );

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
          <span className="text-gray-700 dark:text-gray-200 font-medium">Teams</span>
        </nav>

        {/* Page header */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-white">
            Teams
          </h1>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teams…"
                className="w-full sm:w-72 pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-cyan-400 dark:focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Add button */}
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_16px_rgba(255,183,3,0.4)] cursor-pointer whitespace-nowrap"
            >
              <Plus size={15} />
              Add A New Team
            </button>
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filtered.map((team) => (
              <TeamCard key={team.id} {...team} />
            ))}
          </div>
        ) : (
          <div className="mt-24 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
              <Users size={22} className="text-neutral-400 dark:text-neutral-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No teams found</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Try a different search term</p>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Bot, Users, Store, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useIdeas } from "@/features/entrepreneur/hooks/useIdeas";
import { api } from "@/features/auth/lib/api";
import { DashboardHeader } from "@/features/entrepreneur/components/DashboardHeader";
import { GuidanceTour } from "@/features/guidance/components/GuidanceTour";
import { FeatureCard } from "@/features/entrepreneur/components/FeatureCard";
import { RecentActivity, type ActivityItem } from "@/features/entrepreneur/components/RecentActivity";
import { AiSearchBar } from "@/features/entrepreneur/components/AiSearchBar";
import type { Idea } from "@/features/entrepreneur/types/idea";

function formatToday() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function deriveActivity(ideas: Idea[]): ActivityItem[] {
  const events: { idea: Idea; type: "created" | "updated"; date: Date }[] = [];

  for (const idea of ideas) {
    const created = new Date(idea.created_at);
    const updated = new Date(idea.updated_at);
    if (updated.getTime() - created.getTime() > 60_000) {
      events.push({ idea, type: "updated", date: updated });
    }
    events.push({ idea, type: "created", date: created });
  }

  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  return events.slice(0, 5).map((e) => ({
    id: `${e.idea.id}-${e.type}`,
    icon: FileText,
    activity:
      e.type === "created"
        ? `Created "${e.idea.title || "Untitled idea"}"`
        : `Updated "${e.idea.title || "Untitled idea"}"`,
    module: "Ideas" as const,
    time: formatRelativeTime(e.date),
  }));
}

export default function EntrepreneurDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { ideas, isLoading: ideasLoading, fetchIdeas } = useIdeas();
  const [groupCount, setGroupCount] = useState<number | null>(null);

  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  useEffect(() => {
    api
      .get("/groups")
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data.items ?? []);
        setGroupCount(list.length);
      })
      .catch(() => setGroupCount(0));
  }, []);

  const activityItems = deriveActivity(ideas);

  const FEATURE_CARDS = [
    {
      id: "ideas",
      icon: Lightbulb,
      title: "My ideas",
      description: "Develop and validate your business ideas with AI-assisted analysis.",
      count: ideasLoading ? undefined : String(ideas.length),
      countNote: ideasLoading ? undefined : "ideas",
      route: "/entrepreneur/ideas",
      aiSurface: false,
    },
    {
      id: "aiChat",
      icon: Bot,
      title: "AI chat",
      description: "Generate, refine, and validate ideas in conversation with Bizify.",
      count: undefined,
      countNote: undefined,
      route: "/entrepreneur/ai-chat",
      aiSurface: true,
    },
    {
      id: "team",
      icon: Users,
      title: "Team",
      description: "Collaborate with co-founders. Assign roles, share access.",
      count: groupCount === null ? undefined : String(groupCount),
      countNote: groupCount === null ? undefined : groupCount === 1 ? "group" : "groups",
      route: "/entrepreneur/team",
      aiSurface: false,
    },
    {
      id: "marketplace",
      icon: Store,
      title: "Marketplace",
      description: "Browse mentors, suppliers, and partners to grow your startup.",
      count: undefined,
      countNote: undefined,
      route: "/entrepreneur/marketplace",
      aiSurface: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-neutral-900">
      <DashboardHeader />
      <GuidanceTour />

      <main className="max-w-280 mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-8 flex flex-col gap-5 sm:gap-6">

        {/* Hero */}
        <section data-tour="ai-search" className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-neutral-900 dark:text-white leading-tight tracking-tight">
                Welcome back,{" "}
                <span className="text-amber-500">{firstName}</span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                What would you like to work on today?
              </p>
            </div>
            <div className="text-[11px] sm:text-[12px] font-medium tracking-[0.04em] uppercase text-neutral-400 dark:text-neutral-500 whitespace-nowrap shrink-0 tabular-nums">
              {formatToday()}
            </div>
          </div>

          <AiSearchBar />
        </section>

        {/* Feature cards */}
        <section data-tour="feature-cards">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white tracking-tight">
              Jump back in
            </h2>
            <span className="text-[12px] text-neutral-400 dark:text-neutral-500">4 workspaces</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURE_CARDS.map((card) => (
              <FeatureCard
                key={card.id}
                icon={card.icon}
                title={card.title}
                description={card.description}
                count={card.count}
                countNote={card.countNote}
                aiSurface={card.aiSurface}
                onClick={() => router.push(card.route)}
              />
            ))}
          </div>
        </section>

        

      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Bot, Users, Store, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useIdeas } from "@/features/entrepreneur/hooks/useIdeas";
import { api } from "@/features/auth/lib/api";
import { DashboardHeader } from "@/features/entrepreneur/components/DashboardHeader";
import { GuidanceTour } from "@/features/guidance/components/GuidanceTour";
import { FeatureCard } from "@/features/entrepreneur/components/FeatureCard";
import { RecentActivity, type ActivityItem } from "@/features/entrepreneur/components/RecentActivity";
import { AiSearchBar } from "@/features/entrepreneur/components/AiSearchBar";
import { TokenUsageWidget } from "@/features/entrepreneur/components/TokenUsageWidget";
import { CreateIdeaModal } from "@/features/entrepreneur/components/CreateIdeaModal";
import type { Idea } from "@/features/entrepreneur/types/idea";

function formatToday() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
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

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function EntrepreneurDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { ideas, isLoading: ideasLoading, fetchIdeas, createIdea } = useIdeas();
  const [groupCount, setGroupCount] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const firstName =
    user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

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

  const contextSubtitle = ideasLoading
    ? ""
    : ideas.length === 0
      ? "You're just getting started. No rush."
      : ideas.length === 1
        ? "1 idea in progress. Keep building."
        : `${ideas.length} ideas in progress. Keep building.`;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-neutral-900">
      <DashboardHeader />
      <GuidanceTour />

      <motion.main
        variants={stagger}
        initial="hidden"
        animate="show"
        className="max-w-280 mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 flex flex-col"
      >

        {/* ── Welcome + AI search ─────────────────────────────────────────────── */}
        <motion.section variants={fadeUp} data-tour="ai-search" className="flex flex-col gap-4 mb-10 sm:mb-12">
          <div className="flex flex-col">
            <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-neutral-400 dark:text-neutral-500 tabular-nums mb-1">
              {formatToday()}
            </p>
            <h1 className="text-2xl sm:text-[28px] font-bold text-neutral-900 dark:text-white leading-tight tracking-tight">
              {timeGreeting()},{" "}
              <span className="text-amber-500">{firstName}</span>
            </h1>
            {contextSubtitle && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mt-2">
                {contextSubtitle}
              </p>
            )}
          </div>
          <AiSearchBar />
        </motion.section>

        {/* ── Feature workspaces ──────────────────────────────────────────────── */}
        <motion.section variants={fadeUp} data-tour="feature-cards" className="mb-8 sm:mb-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400 dark:text-neutral-500 mb-3">
            Your workspaces
          </h2>

          {!ideasLoading && ideas.length === 0 ? (
            /* ── Zero-state: guided first step ─────────────────────────────── */
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="text-left w-full rounded-xl border border-amber-200/60 dark:border-amber-700/30 bg-amber-50/40 dark:bg-amber-950/20 p-6 hover:bg-amber-50/80 dark:hover:bg-amber-950/30 hover:border-amber-300/60 dark:hover:border-amber-600/40 transition-colors"
              >
                <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-amber-600 dark:text-amber-500 mb-2">
                  First step
                </p>
                <h3 className="text-[17px] font-semibold text-neutral-900 dark:text-white leading-snug">
                  Add your first idea
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                  One sentence is enough. Bizify will help you turn it into a plan.
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-amber-600 dark:text-amber-500">
                  Get started →
                </span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <FeatureCard
                  icon={Bot}
                  title="AI chat"
                  description="Explore and shape your ideas in conversation."
                  aiSurface
                  variant="compact"
                  onClick={() => router.push("/entrepreneur/ai-chat")}
                />
                <FeatureCard
                  icon={Users}
                  title="Team"
                  description="Collaborate with co-founders. Assign roles, share access."
                  variant="compact"
                  onClick={() => router.push("/entrepreneur/team")}
                />
              </div>
            </div>
          ) : (
            /* ── Normal workspace grid ──────────────────────────────────────── */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <FeatureCard
                icon={Lightbulb}
                title="My ideas"
                description="Develop and validate your business ideas with AI-assisted analysis."
                count={ideasLoading ? undefined : String(ideas.length)}
                countNote={
                  ideasLoading ? undefined : ideas.length === 1 ? "idea" : "ideas"
                }
                variant="primary"
                action={{
                  label: "+ New idea",
                  onClick: () => setShowCreateModal(true),
                }}
                onClick={() => router.push("/entrepreneur/ideas")}
              />
              <FeatureCard
                icon={Bot}
                title="AI chat"
                description="Generate, refine, and validate ideas in real-time conversation with Bizify."
                aiSurface
                variant="primary"
                onClick={() => router.push("/entrepreneur/ai-chat")}
              />
              <FeatureCard
                icon={Users}
                title="Team"
                description="Collaborate with co-founders. Assign roles, share access."
                count={groupCount === null ? undefined : String(groupCount)}
                countNote={
                  groupCount === null
                    ? undefined
                    : groupCount === 1
                      ? "group"
                      : "groups"
                }
                variant="compact"
                onClick={() => router.push("/entrepreneur/team")}
              />
              <FeatureCard
                icon={Store}
                title="Marketplace"
                description="Browse mentors, suppliers, and partners to grow your startup."
                variant="compact"
                onClick={() => router.push("/entrepreneur/marketplace")}
              />
            </div>
          )}
        </motion.section>

        {/* ── Activity + Token usage ──────────────────────────────────────────── */}
        <motion.section
          variants={fadeUp}
          className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-4 items-start"
        >
          <RecentActivity items={activityItems} />
          <TokenUsageWidget />
        </motion.section>

      </motion.main>

      {showCreateModal && (
        <CreateIdeaModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(payload) => createIdea(payload).then(() => {})}
        />
      )}
    </div>
  );
}

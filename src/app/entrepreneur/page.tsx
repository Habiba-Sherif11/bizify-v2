"use client";

import {
  Lightbulb, Bot, Users, Store,
  FileText, MessageCircle, UserPlus, BarChart2, Link,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useLanguage } from "@/features/dashboard/context/LanguageContext";
import { DashboardHeader } from "@/features/entrepreneur/components/DashboardHeader";
import { GuidanceTour } from "@/features/guidance/components/GuidanceTour";
import { ChatBotBubble } from "@/features/entrepreneur/components/ChatBotBubble";
import { AiSearchBar } from "@/features/entrepreneur/components/AiSearchBar";
import { FeatureCard } from "@/features/entrepreneur/components/FeatureCard";
import { RecentActivity, type ActivityItem } from "@/features/entrepreneur/components/RecentActivity";

// ─── Static card config (icons + colors only — text comes from translations) ─

const FEATURE_CARD_CONFIGS = [
  { id: "ideas" as const, icon: Lightbulb, iconClassName: "bg-cyan-600" },
  { id: "aiChat" as const, icon: Bot, iconClassName: "bg-linear-to-br from-amber-500 to-yellow-500" },
  { id: "team" as const, icon: Users, iconClassName: "bg-cyan-800" },
  { id: "marketplace" as const, icon: Store, iconClassName: "bg-cyan-600" },
];

const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: "1",
    icon: FileText,
    iconBg: "bg-cyan-600",
    activity: "Updated business model canvas",
    module: "Ideas",
    moduleBg: "bg-cyan-600/10",
    moduleBorder: "border-cyan-600",
    moduleText: "text-cyan-700",
    time: "2 min ago",
  },
  {
    id: "2",
    icon: MessageCircle,
    iconBg: "bg-amber-500",
    activity: "Completed customer interview #4",
    module: "AI Chat",
    moduleBg: "bg-amber-500/10",
    moduleBorder: "border-amber-500",
    moduleText: "text-amber-700",
    time: "1 hr ago",
  },
  {
    id: "3",
    icon: UserPlus,
    iconBg: "bg-cyan-800",
    activity: "Alex Johnson joined the team",
    module: "Team",
    moduleBg: "bg-cyan-800/10",
    moduleBorder: "border-cyan-800",
    moduleText: "text-cyan-900",
    time: "3 hr ago",
  },
  {
    id: "4",
    icon: BarChart2,
    iconBg: "bg-yellow-500",
    activity: "Generated market size report",
    module: "Ideas",
    moduleBg: "bg-yellow-500/10",
    moduleBorder: "border-yellow-500",
    moduleText: "text-yellow-700",
    time: "Yesterday",
  },
  {
    id: "5",
    icon: Link,
    iconBg: "bg-amber-500",
    activity: "Connected Stripe integration",
    module: "AI Chat",
    moduleBg: "bg-amber-500/10",
    moduleBorder: "border-amber-500",
    moduleText: "text-amber-700",
    time: "2 days ago",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const CARD_ROUTES: Record<string, string> = {
  ideas:       "/entrepreneur/ideas",
  team:        "/entrepreneur/team",
  aiChat:      "/entrepreneur/ai-chat",
  marketplace: "/entrepreneur/marketplace",
};

export default function EntrepreneurDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const featureCards = FEATURE_CARD_CONFIGS.map((c) => ({
    ...c,
    title: t.features[c.id].title,
    description: t.features[c.id].description,
    onClick: () => router.push(CARD_ROUTES[c.id] ?? "#"),
  }));

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors">
      <DashboardHeader />
      <GuidanceTour />

      <ChatBotBubble />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 flex flex-col gap-6 sm:gap-8">
        {/* Welcome + AI search */}
        <section
          data-tour="ai-search"
          className="flex flex-col items-center gap-4 sm:gap-6 pt-4 sm:pt-6"
        >
          <div className="text-center space-y-2 px-4">
            <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-white">
              {t.dashboard.welcome}, {firstName}
            </h1>
            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400">
              {t.dashboard.subtitle}
            </p>
          </div>

          <div className="w-full max-w-2xl">
            <AiSearchBar />
          </div>
        </section>

        {/* Feature cards — responsive grid */}
        <section
          data-tour="feature-cards"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
        >
          {featureCards.map((card) => (
            <FeatureCard
              key={card.id}
              icon={card.icon}
              iconClassName={card.iconClassName}
              title={card.title}
              description={card.description}
              onClick={card.onClick}
            />
          ))}
        </section>

        {/* Recent activity */}
        <section data-tour="recent-activity">
          <RecentActivity items={ACTIVITY_ITEMS} onViewAll={() => {}} />
        </section>
      </main>
    </div>
  );
}

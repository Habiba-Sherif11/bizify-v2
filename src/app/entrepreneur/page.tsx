"use client";

import {
  Lightbulb, Bot, Users, Store,
  FileText, MessageCircle, UserPlus, BarChart2, Link,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import { DashboardHeader } from "@/features/entrepreneur/components/DashboardHeader";
import { GuidanceTour } from "@/features/guidance/components/GuidanceTour";
import { ChatBotBubble } from "@/features/entrepreneur/components/ChatBotBubble";
import { AiSearchBar } from "@/features/entrepreneur/components/AiSearchBar";
import { FeatureCard } from "@/features/entrepreneur/components/FeatureCard";
import { RecentActivity, type ActivityItem } from "@/features/entrepreneur/components/RecentActivity";

const FEATURE_CARDS = [
  {
    id: "ideas",
    icon: Lightbulb,
    iconClassName: "bg-cyan-600",
    title: "My Ideas",
    description: "Explore and develop your business ideas with AI-powered insights.",
    route: "/entrepreneur/ideas",
  },
  {
    id: "aiChat",
    icon: Bot,
    iconClassName: "bg-gradient-to-br from-amber-500 to-yellow-500",
    title: "AI Chat",
    description: "Generate, refine, and validate new business ideas in conversation.",
    route: "/entrepreneur/ai-chat",
  },
  {
    id: "team",
    icon: Users,
    iconClassName: "bg-cyan-800",
    title: "Team",
    description: "Collaborate with your co-founders and assign roles to members.",
    route: "/entrepreneur/team",
  },
  {
    id: "marketplace",
    icon: Store,
    iconClassName: "bg-cyan-600",
    title: "Marketplace",
    description: "Browse mentors, suppliers, and partners to grow your startup.",
    route: "/entrepreneur/marketplace",
  },
];

const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: "1",
    icon: FileText,
    iconColor: "bg-cyan-600",
    activity: "Updated business model canvas",
    module: "Ideas",
    time: "2 min ago",
  },
  {
    id: "2",
    icon: MessageCircle,
    iconColor: "bg-amber-500",
    activity: "Completed customer interview #4",
    module: "AI Chat",
    time: "1 hr ago",
  },
  {
    id: "3",
    icon: UserPlus,
    iconColor: "bg-cyan-800",
    activity: "Alex Johnson joined the team",
    module: "Team",
    time: "3 hr ago",
  },
  {
    id: "4",
    icon: BarChart2,
    iconColor: "bg-yellow-500",
    activity: "Generated market size report",
    module: "Ideas",
    time: "Yesterday",
  },
  {
    id: "5",
    icon: Link,
    iconColor: "bg-amber-500",
    activity: "Connected Stripe integration",
    module: "AI Chat",
    time: "2 days ago",
  },
];

export default function EntrepreneurDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const firstName = user?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-neutral-900">
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
              Welcome back, {firstName}
            </h1>
            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400">
              What would you like to work on today?
            </p>
          </div>

          <div className="w-full max-w-2xl">
            <AiSearchBar />
          </div>
        </section>

        {/* Feature cards — 4-column grid */}
        <section
          data-tour="feature-cards"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
        >
          {FEATURE_CARDS.map((card) => (
            <FeatureCard
              key={card.id}
              icon={card.icon}
              iconClassName={card.iconClassName}
              title={card.title}
              description={card.description}
              onClick={() => router.push(card.route)}
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

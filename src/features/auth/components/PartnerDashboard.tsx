"use client";

import { useEffect, useState } from "react";
import { Eye, Users, TrendingUp, Clock, LogOut, User, Building2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";
import { api } from "@/features/auth/lib/api";
import { cn } from "@/lib/utils";

interface ViewerRecord {
  viewer_name: string | null;
  viewer_email: string | null;
  viewer_role: string | null;
  viewed_at: string;
}

interface ViewStats {
  total_views: number;
  unique_viewers: number;
  recent_views: ViewerRecord[];
}

type AccentConfig = {
  gradient: string;
  statCard: string;
  statIcon: string;
  viewerBadge: string;
  avatarBg: string;
  emptyIcon: string;
};

const ACCENT: Record<string, AccentConfig> = {
  supplier: {
    gradient: "from-cyan-500 to-teal-600",
    statCard: "border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20",
    statIcon: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400",
    viewerBadge: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
    avatarBg: "bg-cyan-600",
    emptyIcon: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-400",
  },
  manufacturer: {
    gradient: "from-indigo-500 to-purple-600",
    statCard: "border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20",
    statIcon: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
    viewerBadge: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
    avatarBg: "bg-indigo-600",
    emptyIcon: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-400",
  },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function roleLabel(role: string | null): string {
  if (!role) return "User";
  const r = role.toLowerCase();
  if (r === "entrepreneur") return "Entrepreneur";
  if (r === "mentor") return "Mentor";
  if (r === "supplier") return "Supplier";
  if (r === "manufacturer") return "Manufacturer";
  return role;
}

interface Props {
  partnerType: "supplier" | "manufacturer";
}

export function PartnerDashboard({ partnerType }: Props) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<ViewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const cfg = ACCENT[partnerType];

  const initials = (user?.name || user?.email || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    api
      .get("/marketplace/my-profile/views")
      .then(({ data }) => setStats(data as ViewStats))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 transition-colors">
      {/* Top header bar */}
      <header className={cn("w-full bg-gradient-to-r text-white", cfg.gradient)}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0", cfg.avatarBg)}>
              {initials}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest opacity-75">
                {partnerType === "supplier" ? "Supplier" : "Manufacturer"} Dashboard
              </p>
              <h1 className="text-lg font-bold leading-tight">
                {user?.name || user?.email || "Welcome"}
              </h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="border-white/30 text-white hover:bg-white/20 hover:text-white bg-transparent gap-2 cursor-pointer"
          >
            <LogOut size={14} />
            Log out
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        {/* Profile summary card */}
        <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0", cfg.avatarBg)}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              {user?.name || "—"}
            </h2>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              <Mail size={13} />
              {user?.email}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              <Building2 size={13} />
              <span className="capitalize">{partnerType}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ml-1">
                Approved
              </span>
            </div>
          </div>
        </section>

        {/* Stats row */}
        <section>
          <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
            Profile Analytics
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={<Eye size={20} />}
                label="Total Profile Views"
                value={stats?.total_views ?? 0}
                cfg={cfg}
              />
              <StatCard
                icon={<Users size={20} />}
                label="Unique Viewers"
                value={stats?.unique_viewers ?? 0}
                cfg={cfg}
              />
              <StatCard
                icon={<TrendingUp size={20} />}
                label="Recent Views (last 20)"
                value={stats?.recent_views.length ?? 0}
                cfg={cfg}
              />
            </div>
          )}
        </section>

        {/* Recent viewers */}
        <section>
          <h2 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
            <Clock size={16} />
            Recent Profile Visitors
          </h2>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            {loading ? (
              <div className="p-6 flex flex-col gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                ))}
              </div>
            ) : !stats || stats.recent_views.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-center">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", cfg.emptyIcon)}>
                  <Eye size={20} />
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">No profile views yet</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  When entrepreneurs view your profile in the marketplace, they will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {stats.recent_views.map((v, i) => (
                  <ViewerRow key={i} viewer={v} cfg={cfg} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  cfg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  cfg: AccentConfig;
}) {
  return (
    <div className={cn("rounded-xl border p-5 flex items-center gap-4", cfg.statCard)}>
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", cfg.statIcon)}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value.toLocaleString()}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function ViewerRow({ viewer, cfg }: { viewer: ViewerRecord; cfg: AccentConfig }) {
  const name = viewer.viewer_name || viewer.viewer_email || "Anonymous";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="px-5 py-4 flex items-center gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
      <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0", cfg.avatarBg)}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
          {viewer.viewer_name || "Unknown"}
        </p>
        {viewer.viewer_email && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate flex items-center gap-1">
            <User size={10} />
            {viewer.viewer_email}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {viewer.viewer_role && (
          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", cfg.viewerBadge)}>
            {roleLabel(viewer.viewer_role)}
          </span>
        )}
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          {timeAgo(viewer.viewed_at)}
        </span>
      </div>
    </div>
  );
}

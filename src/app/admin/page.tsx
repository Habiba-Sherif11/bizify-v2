"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Users,
  UserCheck,
  Handshake,
  Activity,
  Clock,
  CheckCircle2,
  Eye,
  Pencil,
  Ban,
  Plus,
  AlertTriangle,
  AlertCircle,
  Download,
  RefreshCw,
  ShieldAlert,
  Settings,
  FileText,
} from "lucide-react";
import { api } from "@/features/auth/lib/api";
import { useAuth } from "@/features/auth/context/AuthContext";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type Stats = {
  total_users: number;
  total_users_change: number;
  active_teams: number;
  active_teams_change: number;
  registered_partners: number;
  registered_partners_change: number;
  system_health: number;
  system_status: string;
  suspended_users: number;
  total_ideas: number;
  users_by_role: Record<string, number>;
  pending_approvals: {
    total: number;
    partner_applications: number;
    team_verification: number;
    supplier_approval: number;
    flagged_reports: number;
  };
  platform_activity: Array<{
    day: string;
    new_users: number;
    team_creations: number;
    ai_requests: number;
  }>;
  recent_users: Array<{
    id: string;
    full_name: string;
    email: string;
    role: string;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
  }>;
  recent_activity: Array<{
    id: string;
    action: string;
    ip_address: string | null;
    created_at: string;
  }>;
  security_alerts: Array<{
    id: string;
    event_type: string;
    details: Record<string, unknown> | null;
    ip_address: string | null;
    created_at: string;
  }>;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`.replace(".0K", "K");
  return String(n);
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hrs < 24) return `${hrs} hr ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function formatJoinDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

function prettyAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function roleLabel(role: string): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

const ROLE_COLORS: Record<string, string> = {
  ENTREPRENEUR: "bg-amber-100 text-amber-700",
  MENTOR: "bg-blue-100 text-blue-700",
  SUPPLIER: "bg-purple-100 text-purple-700",
  MANUFACTURER: "bg-teal-100 text-teal-700",
  ADMIN: "bg-red-100 text-red-700",
  USER: "bg-neutral-100 text-neutral-600",
};

const MODULE_USAGE = [
  { name: "AI Chat", pct: 88, color: "#F97316" },
  { name: "Marketplace", pct: 72, color: "#3B82F6" },
  { name: "Teams", pct: 64, color: "#8B5CF6" },
  { name: "My Ideas", pct: 58, color: "#F59E0B" },
  { name: "Business Validation Tools", pct: 46, color: "#10B981" },
];

const ALERT_SEVERITY: Record<string, { label: string; cls: string }> = {
  HIGH: { label: "RISK", cls: "bg-red-100 text-red-600" },
  MEDIUM: { label: "MEDIUM", cls: "bg-amber-100 text-amber-600" },
  LOW: { label: "LOW", cls: "bg-neutral-100 text-neutral-500" },
};

function alertSeverity(eventType: string) {
  const t = eventType.toUpperCase();
  if (t.includes("FAIL") || t.includes("BREACH") || t.includes("HIGH") || t.includes("BLOCK"))
    return ALERT_SEVERITY.HIGH;
  if (t.includes("WARN") || t.includes("ANOMALY") || t.includes("DELAY") || t.includes("LOCK"))
    return ALERT_SEVERITY.MEDIUM;
  return ALERT_SEVERITY.LOW;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label, value, change, icon: Icon, iconBg, trend,
}: {
  label: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  iconBg: string;
  trend?: React.ReactNode;
}) {
  const positive = (change ?? 0) >= 0;
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-neutral-900 tabular-nums">{value}</p>
        {change !== undefined && (
          <p className={`text-xs font-medium mt-1 ${positive ? "text-green-600" : "text-red-500"}`}>
            {positive ? "+" : ""}{change}% vs last week
          </p>
        )}
      </div>
      {trend && <div className="h-8">{trend}</div>}
    </div>
  );
}

function MiniSparkline({ color }: { color: string }) {
  const pts = [30, 45, 38, 55, 48, 70, 65];
  const max = Math.max(...pts);
  const w = 80, h = 32;
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * w);
  const ys = pts.map((p) => h - (p / max) * h);
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityRange, setActivityRange] = useState<"7d" | "30d">("7d");
  const [suspending, setSuspending] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchStats();
    }
  }, [fetchStats, user]);

  const handleSuspend = async (userId: string, isActive: boolean) => {
    setSuspending(userId);
    try {
      const endpoint = isActive
        ? `/admin/users/${userId}/suspend`
        : `/admin/users/${userId}/unsuspend`;
      await api.patch(endpoint);
      toast.success(isActive ? "User suspended" : "User reinstated");
      fetchStats();
    } catch {
      toast.error("Action failed");
    } finally {
      setSuspending(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3 text-neutral-400">
          <RefreshCw size={24} className="animate-spin" />
          <span className="text-sm">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  const s = stats;
  const pa = s?.pending_approvals;
  const pendingTotal = pa?.total ?? 0;
  const activitySum = s?.platform_activity?.reduce(
    (acc, d) => ({
      new_users: acc.new_users + d.new_users,
      team_creations: acc.team_creations + d.team_creations,
      ai_requests: acc.ai_requests + d.ai_requests,
    }),
    { new_users: 0, team_creations: 0, ai_requests: 0 }
  ) ?? { new_users: 0, team_creations: 0, ai_requests: 0 };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top bar */}
      <header className="bg-white border-b border-neutral-200 h-14 flex items-center px-6 gap-4 sticky top-0 z-10">
        <div className="flex-1">
          <h1 className="text-base font-semibold text-neutral-900">Bizify Admin Dashboard</h1>
          <p className="text-[11px] text-neutral-400">Monitor platform activity, users, teams, partnerships, and system performance.</p>
        </div>
        <input
          type="search"
          placeholder="Search users, teams, partners…"
          className="hidden sm:block w-56 text-xs border border-neutral-200 rounded-lg px-3 py-1.5 bg-neutral-50 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
        <div className="flex items-center gap-2">
          <button onClick={fetchStats} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600" title="Refresh">
            <RefreshCw size={15} />
          </button>
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-xs uppercase">
            {(user?.name || user?.email || "A").charAt(0)}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs font-medium text-neutral-700">{user?.name || user?.email || "Super Admin"}</p>
            <p className="text-[10px] text-neutral-400">Administrator</p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-[1400px] mx-auto space-y-6">

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={formatNum(s?.total_users ?? 0)}
            change={s?.total_users_change}
            icon={Users}
            iconBg="bg-amber-500"
            trend={<MiniSparkline color="#F97316" />}
          />
          <StatCard
            label="Active Teams"
            value={formatNum(s?.active_teams ?? 0)}
            change={s?.active_teams_change}
            icon={UserCheck}
            iconBg="bg-blue-500"
            trend={<MiniSparkline color="#3B82F6" />}
          />
          <StatCard
            label="Registered Partners"
            value={formatNum(s?.registered_partners ?? 0)}
            change={s?.registered_partners_change}
            icon={Handshake}
            iconBg="bg-violet-500"
            trend={<MiniSparkline color="#8B5CF6" />}
          />
          <StatCard
            label="System Health"
            value={`${s?.system_health ?? 99.8}%`}
            icon={Activity}
            iconBg="bg-emerald-500"
            trend={
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span className="text-xs text-emerald-600 font-medium">Operational · All services nominal</span>
              </div>
            }
          />
        </div>

        {/* ── Middle row: Activity chart + Recent Activity ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Chart */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">Platform Activity Overview</h2>
                <p className="text-xs text-neutral-400 mt-0.5">New users, team creations, and AI requests — last 7 days</p>
              </div>
              <div className="flex items-center gap-2">
                {(["7d", "30d"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setActivityRange(r)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${activityRange === r ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"}`}
                  >
                    {r === "7d" ? "7 days" : "30 days"}
                  </button>
                ))}
                <button className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 border border-neutral-200 rounded-lg px-2.5 py-1">
                  <Download size={12} /> Export
                </button>
              </div>
            </div>

            {/* Legend summary */}
            <div className="flex gap-5 mb-3 text-xs">
              <span className="flex items-center gap-1.5 text-neutral-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
                New users <strong className="text-neutral-900">{activitySum.new_users.toLocaleString()}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-neutral-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-400 inline-block" />
                Team creations <strong className="text-neutral-900">{activitySum.team_creations.toLocaleString()}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-neutral-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-neutral-800 inline-block" />
                AI requests <strong className="text-neutral-900">{activitySum.ai_requests.toLocaleString()}</strong>
              </span>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={s?.platform_activity ?? []} barSize={10} barCategoryGap="30%">
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }}
                  cursor={{ fill: "#F9FAFB" }}
                />
                <Bar dataKey="new_users" name="New users" fill="#FBBF24" radius={[3, 3, 0, 0]} />
                <Bar dataKey="team_creations" name="Team creations" fill="#60A5FA" radius={[3, 3, 0, 0]} />
                <Bar dataKey="ai_requests" name="AI requests" fill="#1F2937" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Admin Activity */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-neutral-900">Recent Admin Activity</h2>
              <Link href="/admin/security" className="text-xs text-amber-500 hover:underline font-medium">View all</Link>
            </div>
            <div className="space-y-3">
              {(s?.recent_activity?.length ?? 0) === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4">No recent activity</p>
              ) : (
                s?.recent_activity?.slice(0, 6).map((a) => (
                  <div key={a.id} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Activity size={13} className="text-neutral-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-neutral-800 leading-tight truncate">{prettyAction(a.action)}</p>
                      {a.ip_address && (
                        <p className="text-[10px] text-neutral-400 truncate">{a.ip_address}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400 shrink-0 whitespace-nowrap">{relativeTime(a.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Lower row: Pending Approvals | Module Usage | Alerts ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Pending Approvals */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-neutral-900">Pending Approvals</h2>
              <Link href="/admin/partners" className="text-xs text-amber-500 hover:underline font-medium">View queue</Link>
            </div>
            <p className="text-xs text-neutral-400 mb-4">{pendingTotal} items waiting on review</p>
            <div className="space-y-3">
              {[
                { icon: Handshake, label: "Partner applications", sub: "Awaiting compliance review", count: pa?.partner_applications ?? 0 },
                { icon: UserCheck, label: "Team verification requests", sub: "KYC documents submitted", count: pa?.team_verification ?? 0 },
                { icon: CheckCircle2, label: "Supplier approval requests", sub: "Catalog & MOQ validated", count: pa?.supplier_approval ?? 0 },
                { icon: AlertTriangle, label: "Flagged user reports", sub: "Community moderation queue", count: pa?.flagged_reports ?? 0 },
              ].map(({ icon: Icon, label, sub, count }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-neutral-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-800 truncate">{label}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{sub}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-neutral-900 tabular-nums w-5 text-right">{count}</span>
                    <Link
                      href="/admin/partners"
                      className="text-[10px] font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded px-2 py-1 transition-colors"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Platform Modules Usage */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-neutral-900">Top Platform Modules Usage</h2>
                <p className="text-[10px] text-neutral-400 mt-0.5">Share of daily active sessions</p>
              </div>
              <button className="text-xs text-amber-500 hover:underline font-medium">Details</button>
            </div>
            <div className="space-y-3.5">
              {MODULE_USAGE.map(({ name, pct, color }) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-neutral-700 font-medium">{name}</span>
                    <span className="text-xs font-bold text-neutral-900 tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts & Issues */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-neutral-900">Alerts & Issues</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400">Live operational signal</span>
                <Link href="/admin/security" className="text-xs text-amber-500 hover:underline font-medium">Resolve all</Link>
              </div>
            </div>
            <div className="space-y-3">
              {(s?.security_alerts?.length ?? 0) === 0 ? (
                <div className="flex flex-col items-center gap-2 py-4 text-neutral-400">
                  <CheckCircle2 size={20} />
                  <p className="text-xs">No active alerts</p>
                </div>
              ) : (
                s?.security_alerts?.map((a) => {
                  const sev = alertSeverity(a.event_type);
                  return (
                    <div key={a.id} className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldAlert size={13} className="text-neutral-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-800 truncate">{a.event_type.replace(/_/g, " ")}</p>
                        {a.ip_address && (
                          <p className="text-[10px] text-neutral-400 truncate">IP: {a.ip_address}</p>
                        )}
                        <p className="text-[10px] text-neutral-400">{relativeTime(a.created_at)}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${sev.cls}`}>{sev.label}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom row: Recently Registered Users + Quick Actions ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Users Table */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-neutral-900">Recently Registered Users</h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-xs text-neutral-500 border border-neutral-200 rounded-lg px-2.5 py-1 hover:bg-neutral-50">
                  <Settings size={12} /> Filter
                </button>
                <Link href="/admin/users" className="text-xs text-amber-500 hover:underline font-medium">View all users</Link>
              </div>
            </div>
            <p className="text-[10px] text-neutral-400 mb-4">Last 7 days · sorted by join date</p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left font-semibold text-neutral-500 pb-2 pr-3">Name</th>
                    <th className="text-left font-semibold text-neutral-500 pb-2 pr-3">Email</th>
                    <th className="text-left font-semibold text-neutral-500 pb-2 pr-3">Role</th>
                    <th className="text-left font-semibold text-neutral-500 pb-2 pr-3">Status</th>
                    <th className="text-left font-semibold text-neutral-500 pb-2 pr-3">Joined Date</th>
                    <th className="text-left font-semibold text-neutral-500 pb-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {(s?.recent_users ?? []).map((u) => {
                    const initials = (u.full_name || u.email).slice(0, 2).toUpperCase();
                    const roleCls = ROLE_COLORS[u.role] ?? "bg-neutral-100 text-neutral-600";
                    return (
                      <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-[10px] shrink-0">
                              {initials}
                            </div>
                            <span className="font-medium text-neutral-800 truncate max-w-[120px]">{u.full_name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-3 text-neutral-500 truncate max-w-[160px]">{u.email}</td>
                        <td className="py-2.5 pr-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${roleCls}`}>
                            {roleLabel(u.role)}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3">
                          <span className={`flex items-center gap-1 text-[10px] font-semibold ${u.is_active ? "text-emerald-600" : "text-neutral-400"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-400" : "bg-neutral-300"}`} />
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-neutral-500">{formatJoinDate(u.created_at)}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1">
                            <Link href={`/admin/users?id=${u.id}`} className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
                              <Eye size={13} />
                            </Link>
                            <Link href={`/admin/users?edit=${u.id}`} className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
                              <Pencil size={13} />
                            </Link>
                            <button
                              onClick={() => handleSuspend(u.id, u.is_active)}
                              disabled={suspending === u.id}
                              className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-red-500 disabled:opacity-40"
                              title={u.is_active ? "Suspend user" : "Reinstate user"}
                            >
                              <Ban size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Admin Actions */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-900 mb-1">Quick Admin Actions</h2>
            <p className="text-[10px] text-neutral-400 mb-4">Common operations</p>

            <Link
              href="/admin/users?add=admin"
              className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl py-3 mb-4 transition-colors"
            >
              <Plus size={16} /> Add New Admin
            </Link>

            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/admin/users", icon: Users, label: "Manage Users" },
                { href: "/admin/partners", icon: Handshake, label: "Approve Partners" },
                { href: "/admin/partners?tab=teams", icon: UserCheck, label: "Review Teams" },
                { href: "/admin/security", icon: FileText, label: "View Reports" },
                { href: "/admin/security", icon: ShieldAlert, label: "Security Logs" },
                { href: "/admin/settings", icon: Settings, label: "System Settings" },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-2 text-xs font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 rounded-xl p-3 transition-colors"
                >
                  <Icon size={14} className="text-neutral-500 shrink-0" />
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Users by Role breakdown ── */}
        {s?.users_by_role && Object.keys(s.users_by_role).length > 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-900 mb-4">Users by Role</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(s.users_by_role).map(([role, count]) => (
                <div key={role} className="text-center p-3 rounded-lg bg-neutral-50">
                  <p className="text-xl font-bold text-neutral-900 tabular-nums">{count.toLocaleString()}</p>
                  <p className={`text-[10px] font-semibold mt-1 px-1.5 py-0.5 rounded inline-block ${ROLE_COLORS[role] ?? "bg-neutral-100 text-neutral-600"}`}>
                    {roleLabel(role)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

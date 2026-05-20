"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  CheckCircle2,
  XCircle,
  Users,
  Shield,
  Activity,
  LogOut,
  Loader2,
  Search,
} from "lucide-react";
import { api } from "@/features/auth/lib/api";
import { useAuth } from "@/features/auth/context/AuthContext";
import { parseBackendError } from "@/lib/backend-error";

type PartnerRequest = {
  id: string;
  user_id: string;
  partner_type: "MENTOR" | "SUPPLIER" | "MANUFACTURER";
  company_name?: string | null;
  description?: string | null;
  approval_status: "PENDING" | "APPROVED" | "REJECTED";
  created_at?: string;
  email?: string;
};

type AdminUser = {
  id: string;
  email: string;
  full_name?: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at?: string;
};

type AdminStats = {
  total_users?: number;
  total_entrepreneurs?: number;
  total_partners?: number;
  pending_requests?: number;
  active_subscriptions?: number;
  [key: string]: number | undefined;
};

type Tab = "overview" | "requests" | "users";

function getErr(err: unknown, fallback: string) {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  return data ? parseBackendError(data) : fallback;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState("");
  const [actingOn, setActingOn] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const { data } = await api.get<AdminStats>("/admin/stats");
      setStats(data);
    } catch (err) {
      toast.error(getErr(err, "Failed to load admin stats"));
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const { data } = await api.get<PartnerRequest[]>("/admin/requests");
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getErr(err, "Failed to load partner requests"));
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get<AdminUser[]>("/admin/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getErr(err, "Failed to load users"));
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tab === "requests" && requests.length === 0) loadRequests();
    if (tab === "users" && users.length === 0) loadUsers();
  }, [tab, loadRequests, loadUsers, requests.length, users.length]);

  const handleApprove = async (id: string) => {
    setActingOn(id);
    try {
      await api.patch(`/admin/approve/${id}`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success("Partner approved");
    } catch (err) {
      toast.error(getErr(err, "Failed to approve partner"));
    } finally {
      setActingOn(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Reason for rejection (optional)") ?? "";
    setActingOn(id);
    try {
      await api.patch(`/admin/reject/${id}`, { reason });
      setRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success("Partner rejected");
    } catch (err) {
      toast.error(getErr(err, "Failed to reject partner"));
    } finally {
      setActingOn(null);
    }
  };

  const handleSuspend = async (userId: string, active: boolean) => {
    setActingOn(userId);
    try {
      await api.patch(`/admin/users/${userId}/suspend`, { suspend: active });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !active } : u))
      );
      toast.success(active ? "User suspended" : "User reactivated");
    } catch (err) {
      toast.error(getErr(err, "Failed to update user"));
    } finally {
      setActingOn(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">Admin Console</p>
              <p className="text-xs text-neutral-500">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-neutral-200 dark:border-neutral-800">
          {(
            [
              { key: "overview", label: "Overview", icon: Activity },
              { key: "requests", label: "Partner Requests", icon: CheckCircle2 },
              { key: "users", label: "Users", icon: Users },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px cursor-pointer transition-colors ${
                tab === key
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <section>
            {loadingStats ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-amber-500" size={24} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total users" value={stats?.total_users} />
                <StatCard label="Entrepreneurs" value={stats?.total_entrepreneurs} />
                <StatCard label="Partners" value={stats?.total_partners} />
                <StatCard label="Pending requests" value={stats?.pending_requests} accent />
                <StatCard label="Active subscriptions" value={stats?.active_subscriptions} />
              </div>
            )}
          </section>
        )}

        {/* Partner Requests */}
        {tab === "requests" && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Pending partner requests
              </h2>
              <button
                type="button"
                onClick={loadRequests}
                className="text-sm text-amber-600 hover:text-amber-700 cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {loadingRequests ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-amber-500" size={24} />
              </div>
            ) : requests.length === 0 ? (
              <EmptyState text="No pending partner requests." />
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                          {req.partner_type}
                        </span>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                          {req.company_name || req.email || "Untitled"}
                        </p>
                      </div>
                      {req.description && (
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                          {req.description}
                        </p>
                      )}
                      {req.email && (
                        <p className="mt-1 text-xs text-neutral-400">{req.email}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleApprove(req.id)}
                        disabled={actingOn === req.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle2 size={14} />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(req.id)}
                        disabled={actingOn === req.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Users */}
        {tab === "users" && (
          <section>
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">All users</h2>
              <div className="relative flex-1 sm:flex-none sm:w-72">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by email or name"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-amber-500" size={24} />
              </div>
            ) : filteredUsers.length === 0 ? (
              <EmptyState text="No users match your search." />
            ) : (
              <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 dark:bg-neutral-900">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-neutral-500">Email</th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-500">Role</th>
                      <th className="text-left px-4 py-3 font-medium text-neutral-500">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-neutral-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-t border-neutral-200 dark:border-neutral-700">
                        <td className="px-4 py-3 text-neutral-900 dark:text-white">
                          <div className="font-medium">{u.email}</div>
                          {u.full_name && (
                            <div className="text-xs text-neutral-500">{u.full_name}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300 capitalize">
                          {u.role.toLowerCase()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              u.is_active
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {u.is_active ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleSuspend(u.id, u.is_active)}
                            disabled={actingOn === u.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50 ${
                              u.is_active
                                ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            }`}
                          >
                            {u.is_active ? "Suspend" : "Reactivate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | undefined;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        accent
          ? "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
          : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
      }`}
    >
      <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">
        {value ?? "—"}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 py-16 text-center">
      <p className="text-sm text-neutral-500">{text}</p>
    </div>
  );
}

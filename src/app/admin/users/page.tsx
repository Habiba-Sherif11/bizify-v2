"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Ban,
  CheckCircle2,
  Trash2,
  ChevronUp,
  ChevronDown,
  UserPlus,
  Shield,
} from "lucide-react";
import { api } from "@/features/auth/lib/api";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

const ROLES = ["ENTREPRENEUR", "MENTOR", "SUPPLIER", "MANUFACTURER", "ADMIN", "USER"];

const ROLE_COLORS: Record<string, string> = {
  ENTREPRENEUR: "bg-amber-100 text-amber-700",
  MENTOR: "bg-blue-100 text-blue-700",
  SUPPLIER: "bg-purple-100 text-purple-700",
  MANUFACTURER: "bg-teal-100 text-teal-700",
  ADMIN: "bg-red-100 text-red-700",
  USER: "bg-neutral-100 text-neutral-600",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

export default function UsersPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [sortKey, setSortKey] = useState<"created_at" | "email" | "role">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<{ id: string; name: string } | null>(null);
  const [newRole, setNewRole] = useState("ENTREPRENEUR");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string } | null>(null);
  const [deleteEmail, setDeleteEmail] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users?limit=200");
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase();
      if (q && !u.email.toLowerCase().includes(q) && !(u.full_name ?? "").toLowerCase().includes(q)) return false;
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (statusFilter === "ACTIVE" && !u.is_active) return false;
      if (statusFilter === "INACTIVE" && u.is_active) return false;
      return true;
    })
    .sort((a, b) => {
      let av = a[sortKey] as string;
      let bv = b[sortKey] as string;
      if (!av) av = "";
      if (!bv) bv = "";
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const handleSuspend = async (u: User) => {
    setActionInProgress(u.id);
    try {
      const endpoint = u.is_active
        ? `/admin/users/${u.id}/suspend`
        : `/admin/users/${u.id}/unsuspend`;
      await api.patch(endpoint);
      toast.success(u.is_active ? "User suspended" : "User reinstated");
      fetchUsers();
    } catch {
      toast.error("Action failed");
    } finally {
      setActionInProgress(null);
    }
  };

  const handlePromote = async () => {
    if (!promoteTarget) return;
    setActionInProgress(promoteTarget.id);
    try {
      await api.patch(`/admin/users/${promoteTarget.id}/promote?new_role=${newRole}`);
      toast.success(`Role updated to ${newRole}`);
      setPromoteTarget(null);
      fetchUsers();
    } catch {
      toast.error("Failed to update role");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleteEmail !== deleteTarget.email) {
      toast.error("Email does not match");
      return;
    }
    setActionInProgress(deleteTarget.id);
    try {
      await api.delete(`/admin/users?email=${encodeURIComponent(deleteTarget.email)}`);
      toast.success("User deleted");
      setDeleteTarget(null);
      setDeleteEmail("");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setActionInProgress(null);
    }
  };

  const SortIcon = ({ col }: { col: typeof sortKey }) =>
    sortKey === col
      ? sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      : <ChevronDown size={12} className="opacity-30" />;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 h-14 flex items-center px-6 gap-4 sticky top-0 z-10">
        <div className="flex-1">
          <h1 className="text-base font-semibold text-neutral-900">User Management</h1>
          <p className="text-[11px] text-neutral-400">Manage, suspend, and assign roles to platform users</p>
        </div>
        <button type="button" onClick={fetchUsers} title="Refresh users" className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      <main className="p-6 max-w-[1200px] mx-auto space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-neutral-200 rounded-lg bg-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            title="Filter by role"
            aria-label="Filter by role"
            className="text-xs border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <option value="ALL">All Roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            title="Filter by status"
            aria-label="Filter by status"
            className="text-xs border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <span className="text-xs text-neutral-400 ml-auto">{filtered.length} users</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-100">
                <tr>
                  <th className="text-left font-semibold text-neutral-500 px-4 py-3">
                    <button type="button" className="flex items-center gap-1" onClick={() => toggleSort("email")} title="Sort by email">
                      Name / Email <SortIcon col="email" />
                    </button>
                  </th>
                  <th className="text-left font-semibold text-neutral-500 px-4 py-3">
                    <button type="button" className="flex items-center gap-1" onClick={() => toggleSort("role")} title="Sort by role">
                      Role <SortIcon col="role" />
                    </button>
                  </th>
                  <th className="text-left font-semibold text-neutral-500 px-4 py-3">Status</th>
                  <th className="text-left font-semibold text-neutral-500 px-4 py-3">Verified</th>
                  <th className="text-left font-semibold text-neutral-500 px-4 py-3">
                    <button type="button" className="flex items-center gap-1" onClick={() => toggleSort("created_at")} title="Sort by join date">
                      Joined <SortIcon col="created_at" />
                    </button>
                  </th>
                  <th className="text-left font-semibold text-neutral-500 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-neutral-400">
                      <RefreshCw size={16} className="animate-spin inline mr-2" /> Loading users…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-neutral-400">No users found</td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const initials = (u.full_name || u.email).slice(0, 2).toUpperCase();
                    const roleCls = ROLE_COLORS[u.role] ?? "bg-neutral-100 text-neutral-600";
                    return (
                      <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-[10px] shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-medium text-neutral-800 truncate max-w-[140px]">{u.full_name || "—"}</p>
                              <p className="text-neutral-400 truncate max-w-[180px]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${roleCls}`}>
                            {u.role.charAt(0) + u.role.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 font-semibold ${u.is_active ? "text-emerald-600" : "text-neutral-400"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-400" : "bg-neutral-300"}`} />
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.is_verified
                            ? <CheckCircle2 size={14} className="text-emerald-500" />
                            : <span className="text-neutral-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-neutral-500">{formatDate(u.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => { setPromoteTarget({ id: u.id, name: u.full_name || u.email }); setNewRole(u.role); }}
                              className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 hover:text-blue-600 transition-colors"
                              title="Change role"
                            >
                              <Shield size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSuspend(u)}
                              disabled={actionInProgress === u.id}
                              className={`p-1.5 rounded hover:bg-neutral-100 transition-colors disabled:opacity-40 ${u.is_active ? "text-neutral-400 hover:text-amber-600" : "text-emerald-500 hover:text-emerald-700"}`}
                              title={u.is_active ? "Suspend user" : "Reinstate user"}
                            >
                              {u.is_active ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setDeleteTarget({ id: u.id, email: u.email }); setDeleteEmail(""); }}
                              className="p-1.5 rounded hover:bg-neutral-100 text-neutral-400 hover:text-red-500 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Promote Modal */}
      {promoteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus size={18} className="text-amber-500" />
              <h3 className="font-semibold text-neutral-900">Change Role</h3>
            </div>
            <p className="text-xs text-neutral-500">Update role for <strong>{promoteTarget.name}</strong></p>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              title="Select new role"
              aria-label="Select new role"
              className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
            </select>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPromoteTarget(null)}
                className="flex-1 border border-neutral-200 rounded-xl py-2 text-sm text-neutral-600 hover:bg-neutral-50"
              >Cancel</button>
              <button
                type="button"
                onClick={handlePromote}
                disabled={!!actionInProgress}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-2 text-sm font-semibold disabled:opacity-50"
              >Update Role</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center gap-2">
              <Trash2 size={18} className="text-red-500" />
              <h3 className="font-semibold text-neutral-900">Delete User</h3>
            </div>
            <p className="text-xs text-neutral-500">
              This is irreversible. Type <strong className="text-neutral-800">{deleteTarget.email}</strong> to confirm deletion.
            </p>
            <input
              type="email"
              placeholder="Confirm email…"
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-400"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setDeleteTarget(null); setDeleteEmail(""); }}
                className="flex-1 border border-neutral-200 rounded-xl py-2 text-sm text-neutral-600 hover:bg-neutral-50"
              >Cancel</button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteEmail !== deleteTarget.email || !!actionInProgress}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2 text-sm font-semibold disabled:opacity-40"
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

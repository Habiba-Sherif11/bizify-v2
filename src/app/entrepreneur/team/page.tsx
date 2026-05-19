"use client";

import { useState, useEffect } from "react";
import { Home, ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { api } from "@/features/auth/lib/api";
import { TeamCard } from "@/features/entrepreneur/components/TeamCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GroupResponse {
  id: string;
  name: string;
  description: string | null;
  default_role: "OWNER" | "EDITOR" | "VIEWER";
  is_chat_enabled: boolean;
  business_id: string;
  created_at: string;
  updated_at: string;
}

// ─── Create Team Modal ────────────────────────────────────────────────────────

function CreateTeamModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, description: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      await onCreate(trimmed, description.trim());
      // parent calls setShowModal(false) on success
    } catch {
      // parent already showed error toast; keep modal open for retry
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-300/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800 rounded-xl shadow-2xl flex flex-col">
        <div className="px-4 sm:px-6 py-5 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">Create a New Team</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-900 dark:text-white">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter team name"
              className="h-12 px-3.5 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200 placeholder:text-slate-400 dark:placeholder:text-gray-500 text-sm outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-900 dark:text-white">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter team description"
              className="h-12 px-3.5 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200 placeholder:text-slate-400 dark:placeholder:text-gray-500 text-sm outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-neutral-700 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
            className="w-full sm:w-auto px-4 py-2 bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_0_10px_rgba(255,183,3,0.5)] rounded-lg text-sm font-medium text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating…" : "Create Team"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyTeams({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-sm font-medium text-gray-800 dark:text-white">No Teams Yet</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
        Create your first team to start collaborating with others.
      </p>
      <button
        type="button"
        onClick={onCreateClick}
        className="px-4 py-2 bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_14px_rgba(255,183,3,0.5)] rounded-lg text-sm font-medium text-white cursor-pointer"
      >
        Create a New Team
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamsPage() {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api
      .get("/groups")
      .then((res) => {
        const raw = res.data;
        setGroups(Array.isArray(raw) ? raw : (raw.items ?? raw.data ?? []));
      })
      .catch(() => toast.error("Failed to load teams"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    try {
      await api.delete(`/groups/${id}`);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      toast.success("Team deleted");
    } catch {
      toast.error("Failed to delete team");
    }
  }

  async function handleCreate(name: string, description: string) {
    try {
      const { data } = await api.post<GroupResponse>("/groups", {
        name,
        description: description || null,
        default_role: "VIEWER",
        is_chat_enabled: true,
      });
      setGroups((prev) => [data, ...prev]);
      toast.success("Team created");
      setShowModal(false);
    } catch {
      toast.error("Failed to create team");
    }
  }

  const filtered = groups.filter((g) =>
    (g.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 pt-6 text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/entrepreneur"
            className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <Home size={14} />
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200 font-medium">Teams</span>
        </nav>

        {/* Title row */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-white">
            Teams
          </h1>
        </div>

        {/* Search + Create row */}
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_16px_rgba(255,183,3,0.4)] cursor-pointer whitespace-nowrap"
          >
            Create a New Team
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyTeams onCreateClick={() => setShowModal(true)} />
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filtered.map((group) => (
              <Link key={group.id} href={`/entrepreneur/team/${group.id}?name=${encodeURIComponent(group.name)}`}>
                <TeamCard
                  id={group.id}
                  name={group.name}
                  description={group.description ?? ""}
                  date={new Date(group.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  members={[]}
                  onDeleteClick={() => handleDelete(group.id)}
                />
              </Link>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <CreateTeamModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

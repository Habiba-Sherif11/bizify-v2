"use client";

import { useState, useEffect, use } from "react";
import { Home, ChevronRight, Settings, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/features/auth/lib/api";
import { parseBackendError } from "@/lib/backend-error";
import { TeamMembersCard } from "@/features/entrepreneur/components/TeamMembersCard";
import { InviteTeamMemberModal } from "@/features/entrepreneur/components/InviteTeamMemberModal";
import { TeamSettingsModal } from "@/features/entrepreneur/components/TeamSettingsModal";
import { useAuth } from "@/features/auth/context/AuthContext";

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

interface MemberResponse {
  id: string;
  user_id: string;
  group_id: string;
  email: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  status: string;
  accessible_ideas: { id: string; title: string }[];
  joined_at: string;
}

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [groupsRes, membersRes] = await Promise.all([
          api.get<GroupResponse[]>("/groups"),
          api.get<MemberResponse[]>(`/groups/${id}/members`),
        ]);
        const found = Array.isArray(groupsRes.data)
          ? groupsRes.data.find((g) => g.id === id)
          : undefined;
        if (!found) {
          toast.error("Team not found");
          router.push("/entrepreneur/team");
          return;
        }
        setGroup(found);
        setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
      } catch {
        toast.error("Failed to load team");
        router.push("/entrepreneur/team");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleInvite(email: string, role: "VIEWER" | "EDITOR" | "OWNER") {
    try {
      await api.post(`/groups/${id}/invites`, { email, role });
      toast.success("Invitation sent");
      setShowInvite(false);
    } catch {
      toast.error("Failed to send invitation");
    }
  }

  async function handleUpdate(name: string, description: string, _allowMembersToInvite?: boolean) {
    try {
      const { data } = await api.patch<GroupResponse>(`/groups/${id}`, {
        name,
        description: description || null,
      });
      setGroup(data);
      toast.success("Team updated");
      setShowSettings(false);
    } catch {
      toast.error("Failed to update team");
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/groups/${id}`);
      toast.success("Team deleted");
      router.push("/entrepreneur/team");
    } catch (err: unknown) {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(data ? parseBackendError(data) : "Failed to delete team");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!group) return null;

  async function handleMemberUpdated() {
    try {
      const membersRes = await api.get<MemberResponse[]>(`/groups/${id}/members`);
      setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
    } catch {
      toast.error("Failed to refresh members");
    }
  }

  const teamForCard = {
    id: group.id,
    name: group.name,
    description: group.description,
    default_role: group.default_role,
    is_chat_enabled: group.is_chat_enabled,
    created_at: group.created_at,
    members: members.map((m) => {
      const upperStatus = m.status?.toUpperCase();
      return {
        id: m.id,
        user_id: m.user_id,
        email: m.email,
        name: m.email?.split("@")[0]?.trim() || m.email || "Member",
        role: m.role,
        status: (upperStatus === "ACTIVE" ? "ACTIVE" : "PENDING") as "ACTIVE" | "PENDING",
        joined_at: m.joined_at,
        accessible_ideas: m.accessible_ideas,
      };
    }),
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 pt-6 text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/entrepreneur"
            className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <Home size={14} />
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <Link
            href="/entrepreneur/team"
            className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Teams
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200 font-medium break-all">{group.name}</span>
        </nav>

        {/* Title row */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-white">
              {group.name}
            </h1>
            {group.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {group.description}
              </p>
            )}
          </div>
          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowInvite(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_16px_rgba(255,183,3,0.4)] cursor-pointer whitespace-nowrap"
            >
              <UserPlus size={15} />
              Invite Member
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              title="Settings"
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Members */}
        <div className="mt-8">
          <TeamMembersCard
            team={teamForCard}
            groupId={id}
            currentUserEmail={user?.email ?? ""}
            onMemberUpdated={handleMemberUpdated}
          />
        </div>
      </main>

      {showInvite && (
        <InviteTeamMemberModal
          onClose={() => setShowInvite(false)}
          onSubmit={handleInvite}
        />
      )}

      {showSettings && (
        <TeamSettingsModal
          team={group}
          onClose={() => setShowSettings(false)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

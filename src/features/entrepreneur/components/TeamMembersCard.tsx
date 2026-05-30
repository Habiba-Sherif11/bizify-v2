"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Shield, Eye, Pencil, Trash2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/features/auth/lib/api";
import { IdeaAccessModal } from "./IdeaAccessModal";

interface Member {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  status: "ACTIVE" | "PENDING";
  joined_at: string;
  accessible_ideas: { id: string; title: string }[];
}

interface TeamDetail {
  id: string;
  name: string;
  description: string | null;
  members: Member[];
  default_role: "OWNER" | "EDITOR" | "VIEWER";
  is_chat_enabled: boolean;
  created_at: string;
}

interface TeamMembersCardProps {
  team: TeamDetail;
  groupId: string;
  currentUserEmail: string;
  onMemberUpdated: () => void;
}

const ROLES = [
  { value: "OWNER" as const, label: "Owner", icon: KeyRound, desc: "Full access, manage members" },
  { value: "EDITOR" as const, label: "Editor", icon: Pencil, desc: "Create, edit, manage" },
  { value: "VIEWER" as const, label: "Viewer", icon: Eye, desc: "View and comment" },
];

const getRoleColor = (role: string) => {
  switch (role) {
    case "OWNER": return "text-amber-500 bg-amber-500/20";
    case "EDITOR": return "text-slate-700 bg-slate-100 dark:text-slate-200 dark:bg-slate-700";
    case "VIEWER": return "text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-700";
    default: return "text-gray-500 bg-gray-100";
  }
};

const getRoleLabel = (role: string) =>
  role.charAt(0) + role.slice(1).toLowerCase();

function MemberMenu({
  member,
  groupId,
  currentUserEmail,
  onIdeaAccess,
  onMemberUpdated,
}: {
  member: Member;
  groupId: string;
  currentUserEmail: string;
  onIdeaAccess: () => void;
  onMemberUpdated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isCurrentUser = member.email === currentUserEmail;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowRoleMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function changeRole(role: "OWNER" | "EDITOR" | "VIEWER") {
    setSaving(true);
    setOpen(false);
    setShowRoleMenu(false);
    try {
      await api.patch(`/groups/${groupId}/members/${member.id}`, { role });
      toast.success(`Role changed to ${getRoleLabel(role)}`);
      onMemberUpdated();
    } catch {
      toast.error("Failed to change role");
    } finally {
      setSaving(false);
    }
  }

  async function removeMember() {
    setOpen(false);
    if (!confirm(`Remove ${member.name} from the team?`)) return;
    try {
      await api.delete(`/groups/${groupId}/members/${member.id}`);
      toast.success("Member removed");
      onMemberUpdated();
    } catch {
      toast.error("Failed to remove member");
    }
  }

  if (isCurrentUser) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={saving}
        onClick={() => { setOpen((v) => !v); setShowRoleMenu(false); }}
        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors cursor-pointer shrink-0"
      >
        <MoreVertical size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg overflow-hidden">
          {/* Change Role */}
          <button
            type="button"
            onClick={() => setShowRoleMenu((v) => !v)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <Shield size={13} className="text-amber-500" />
            Change Role
          </button>

          {showRoleMenu && (
            <div className="border-t border-neutral-100 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-750">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => changeRole(r.value)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2 text-xs transition-colors ${
                    member.role === r.value
                      ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700"
                  }`}
                >
                  <r.icon size={12} />
                  {r.label}
                </button>
              ))}
            </div>
          )}

          {/* Idea Access */}
          <button
            type="button"
            onClick={() => { setOpen(false); onIdeaAccess(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors border-t border-neutral-100 dark:border-neutral-700"
          >
            <Eye size={13} className="text-cyan-500" />
            Manage Idea Access
          </button>

          {/* Remove */}
          <button
            type="button"
            onClick={removeMember}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-neutral-100 dark:border-neutral-700"
          >
            <Trash2 size={13} />
            Remove Member
          </button>
        </div>
      )}
    </div>
  );
}

export function TeamMembersCard({ team, groupId, currentUserEmail, onMemberUpdated }: TeamMembersCardProps) {
  const [ideaAccessMember, setIdeaAccessMember] = useState<Member | null>(null);
  const [showAllMembers, setShowAllMembers] = useState(false);

  const displayedMembers = showAllMembers ? team.members : team.members.slice(0, 10);

  return (
    <>
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-5 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Team Members</h2>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
          {displayedMembers.map((member) => {
            const isCurrentUser = member.email === currentUserEmail;
            return (
              <div
                key={member.id}
                className="px-4 sm:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-semibold shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {member.name}
                      </p>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold text-cyan-600 bg-cyan-50 dark:bg-cyan-900/30 dark:text-cyan-400 rounded-full">
                          You
                        </span>
                      )}
                      {member.status === "PENDING" && (
                        <span className="px-2 py-0.5 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-900/50 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-gray-400 truncate">
                      {member.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <div className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                    {getRoleLabel(member.role)}
                  </div>
                  <MemberMenu
                    member={member}
                    groupId={groupId}
                    currentUserEmail={currentUserEmail}
                    onIdeaAccess={() => setIdeaAccessMember(member)}
                    onMemberUpdated={onMemberUpdated}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {!showAllMembers && team.members.length > 10 && (
          <div className="px-4 sm:px-6 py-4 text-center border-t border-neutral-100 dark:border-neutral-700">
            <button type="button" onClick={() => setShowAllMembers(true)} className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 cursor-pointer">
              View All {team.members.length} Members
            </button>
          </div>
        )}

        {team.members.length === 0 && (
          <div className="px-4 sm:px-6 py-12 text-center">
            <p className="text-sm text-neutral-500 dark:text-gray-400">No members yet</p>
          </div>
        )}
      </div>

      {ideaAccessMember && (
        <IdeaAccessModal
          member={ideaAccessMember}
          groupId={groupId}
          onClose={() => setIdeaAccessMember(null)}
          onUpdated={onMemberUpdated}
        />
      )}
    </>
  );
}

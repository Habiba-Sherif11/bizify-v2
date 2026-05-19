"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { IdeaAccessModal } from "./IdeaAccessModal";

interface Member {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  status: "ACTIVE" | "PENDING";
  joined_at: string;
  idea_count?: number;
  project_count?: number;
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
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "OWNER":
      return "text-amber-500 bg-amber-500/20";
    case "EDITOR":
      return "text-slate-700 bg-slate-100";
    case "VIEWER":
      return "text-slate-500 bg-slate-100";
    default:
      return "text-gray-500 bg-gray-100";
  }
};

const getRoleLabel = (role: string) => {
  return role.charAt(0) + role.slice(1).toLowerCase();
};

export function TeamMembersCard({ team }: TeamMembersCardProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAllMembers, setShowAllMembers] = useState(false);

  const displayedMembers = showAllMembers ? team.members : team.members.slice(0, 3);

  return (
    <>
      <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-5 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Team Members</h2>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
          {displayedMembers.map((member) => (
            <div key={member.id} className="px-4 sm:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white font-semibold shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {member.name}
                    </p>
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

              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                <div className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                  {member.role === "OWNER" ? "Owner" : getRoleLabel(member.role)}
                </div>

                {member.idea_count != null && member.project_count != null && (
                  <div className="px-3 py-1.5 bg-amber-500/20 rounded-full text-xs font-semibold text-amber-500">
                    Ideas: {member.idea_count} Projects
                  </div>
                )}

                <button type="button" onClick={() => setSelectedMember(member)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors cursor-pointer shrink-0">
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {displayedMembers.length < team.members.length && !showAllMembers && (
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

      {selectedMember && (
        <IdeaAccessModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}
    </>
  );
}

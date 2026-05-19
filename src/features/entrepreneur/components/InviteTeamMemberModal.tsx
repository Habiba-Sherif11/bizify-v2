"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface InviteTeamMemberModalProps {
  onClose: () => void;
  onSubmit: (email: string, role: "VIEWER" | "EDITOR" | "OWNER") => Promise<void>;
}

type Role = "VIEWER" | "EDITOR" | "OWNER";

const ROLES: { id: Role; label: string; icon: string; description: string }[] = [
  {
    id: "VIEWER",
    label: "Viewer",
    icon: "👁️",
    description: "Can view and comment on all screens.",
  },
  {
    id: "EDITOR",
    label: "Editor",
    icon: "✏️",
    description: "Can create, edit, and manage in all screens.",
  },
  {
    id: "OWNER",
    label: "Owner",
    icon: "🔑",
    description: "Has full access, including managing team members.",
  },
];

export function InviteTeamMemberModal({
  onClose,
  onSubmit,
}: InviteTeamMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("VIEWER");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await onSubmit(email.trim(), role);
      // parent calls setShowInvite(false) on success
    } catch {
      // parent already showed error toast; keep modal open for retry
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-300/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 py-5 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between sticky top-0 bg-white dark:bg-neutral-800">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
            Invite New Team Member
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-base font-medium text-neutral-900 dark:text-white">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="h-12 px-4 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200 placeholder:text-slate-400 text-sm outline-none focus:border-amber-400 transition-colors"
            />
            <p className="text-sm text-slate-500 dark:text-gray-400">
              They will receive an email with instructions to join your team.
            </p>
          </div>

          {/* Role Selection */}
          <div className="flex flex-col gap-3">
            <label className="text-base font-medium text-neutral-900 dark:text-white">
              Assign Role
            </label>
            <div className="space-y-3">
              {ROLES.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    role === r.id
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 hover:border-amber-400"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-lg shrink-0">
                      {r.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-neutral-900 dark:text-white">
                        {r.label}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-gray-400">
                        {r.description}
                      </p>
                    </div>
                    <div className="w-5 h-5 rounded-sm border-2 border-slate-300 dark:border-neutral-600 flex items-center justify-center shrink-0">
                      {role === r.id && (
                        <div className="w-3 h-3 bg-amber-500 rounded-sm" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-neutral-700 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-neutral-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!email.trim() || loading}
            className="w-full sm:w-auto px-6 py-2 bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_0_10px_rgba(255,183,3,0.5)] rounded-lg text-sm font-medium text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
          >
            {loading ? "Sending…" : "Invite Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

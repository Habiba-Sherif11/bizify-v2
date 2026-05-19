"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface TeamSettingsModalProps {
  team: {
    id: string;
    name: string;
    description: string | null;
  };
  onClose: () => void;
  onUpdate: (
    name: string,
    description: string,
    allowMembersToInvite: boolean
  ) => Promise<void>;
  onDelete: () => Promise<void>;
}

export function TeamSettingsModal({
  team,
  onClose,
  onUpdate,
  onDelete,
}: TeamSettingsModalProps) {
  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || "");
  const [allowMembersToInvite, setAllowMembersToInvite] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onUpdate(name.trim(), description.trim(), allowMembersToInvite);
      // parent calls setShowSettings(false) on success
    } catch {
      // parent already showed error toast; keep modal open for retry
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete();
      // parent redirects on success; on error parent shows toast and we stay open
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-300/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="px-4 sm:px-6 py-5 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between sticky top-0 bg-white dark:bg-neutral-800">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">Team Settings</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-6 flex flex-col gap-6 flex-1">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-900 dark:text-white">Team Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="h-10 px-4 rounded-lg border border-slate-300 dark:border-neutral-600 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-200 text-sm outline-none focus:border-amber-400 transition-colors" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-900 dark:text-white">Team Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="h-10 px-4 rounded-lg border border-slate-300 dark:border-neutral-600 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-200 text-sm outline-none focus:border-amber-400 transition-colors" />
          </div>

          <div className="flex items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-base font-medium text-neutral-900 dark:text-white">Allow members to invite others</p>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">If enabled, administrators and contributors can invite.</p>
            </div>
            <button type="button" onClick={() => setAllowMembersToInvite(!allowMembersToInvite)} className={`w-11 h-6 rounded-full transition-colors ${allowMembersToInvite ? "bg-amber-500" : "bg-slate-200"} relative`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${allowMembersToInvite ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-500">Danger Zone</h3>
            </div>

            {!showDeleteConfirm ? (
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <p className="font-bold text-neutral-900 dark:text-white">Delete this group</p>
                  <p className="text-sm text-slate-600 dark:text-gray-300 mt-2">Once deleted, all projects and assets will be permanently removed.</p>
                </div>
                <button type="button" onClick={() => setShowDeleteConfirm(true)} className="px-6 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 cursor-pointer shrink-0 whitespace-nowrap">
                  Delete Group
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-neutral-900 dark:text-white font-medium">Are you sure? This cannot be undone.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={() => setShowDeleteConfirm(false)} disabled={loading} className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm font-medium rounded-lg cursor-pointer disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="button" onClick={handleDelete} disabled={loading} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg cursor-pointer disabled:opacity-50">
                    {loading ? "Deleting" : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-neutral-700 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-neutral-800">
          <button type="button" onClick={onClose} disabled={loading} className="w-full sm:w-auto px-5 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg cursor-pointer disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={handleUpdate} disabled={!name.trim() || loading} className="w-full sm:w-auto px-6 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg cursor-pointer disabled:opacity-50">
            {loading ? "Saving" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

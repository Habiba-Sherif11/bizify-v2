"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Team Settings</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="team-name" className="text-sm font-medium text-neutral-900 dark:text-white">
              Team Name
            </Label>
            <Input
              id="team-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-200 focus:border-amber-400 bg-gray-100"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="team-description" className="text-sm font-medium text-neutral-900 dark:text-white">
              Team Description
            </Label>
            <Input
              id="team-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-200 focus:border-amber-400 bg-gray-100"
            />
          </div>

          <div className="flex items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-base font-medium text-neutral-900 dark:text-white">
                Allow members to invite others
              </p>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                If enabled, administrators and contributors can invite.
              </p>
            </div>
            <Switch
              checked={allowMembersToInvite}
              onCheckedChange={setAllowMembersToInvite}
              className="data-[state=checked]:bg-amber-500 shrink-0"
            />
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
                  <p className="text-sm text-slate-600 dark:text-gray-300 mt-2">
                    Once deleted, all projects and assets will be permanently removed.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="shrink-0 bg-red-600 hover:bg-red-700 text-white border-0"
                >
                  Delete Group
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-neutral-900 dark:text-white font-medium">
                  Are you sure? This cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white border-0"
                  >
                    {loading ? "Deleting" : "Delete"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto text-gray-600 dark:text-gray-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpdate}
            disabled={!name.trim() || loading}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white border-0"
          >
            {loading ? "Saving" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

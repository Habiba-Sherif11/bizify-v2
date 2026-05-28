"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
    } catch {
      // parent already showed error toast; keep modal open for retry
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Invite New Team Member</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 flex flex-col gap-6">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="invite-email" className="text-base font-medium text-neutral-900 dark:text-white">
              Email Address
            </Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="h-12 px-4 dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-200 focus:border-amber-400"
            />
            <p className="text-sm text-slate-500 dark:text-gray-400">
              They will receive an email with instructions to join your team.
            </p>
          </div>

          {/* Role Selection */}
          <div className="flex flex-col gap-3">
            <Label className="text-base font-medium text-neutral-900 dark:text-white">
              Assign Role
            </Label>
            <RadioGroup
              value={role}
              onValueChange={(v) => setRole(v as Role)}
              className="space-y-3"
            >
              {ROLES.map((r) => (
                <div
                  key={r.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    role === r.id
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 hover:border-amber-400"
                  }`}
                  onClick={() => setRole(r.id)}
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
                    <RadioGroupItem
                      value={r.id}
                      id={`role-${r.id}`}
                      className="mt-1 border-slate-300 dark:border-neutral-600 data-[state=checked]:border-amber-500 data-[state=checked]:text-amber-500"
                    />
                  </div>
                </div>
              ))}
            </RadioGroup>
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
            onClick={handleSubmit}
            disabled={!email.trim() || loading}
            variant="primary-gradient"
            className="w-full sm:w-auto"
          >
            {loading ? "Sending…" : "Invite Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

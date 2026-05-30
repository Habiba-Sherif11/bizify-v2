"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/features/auth/lib/api";

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

interface Idea {
  id: string;
  title: string;
  status?: string;
  hasAccess: boolean;
}

interface BackendIdea {
  id: string;
  title: string;
  status?: string;
}

interface IdeaAccessModalProps {
  member: Member;
  groupId: string;
  onClose: () => void;
  onUpdated: () => void;
}

export function IdeaAccessModal({ member, groupId, onClose, onUpdated }: IdeaAccessModalProps) {
  const [search, setSearch] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [allIdeasEnabled, setAllIdeasEnabled] = useState(false);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadIdeas() {
      setLoadingIdeas(true);
      try {
        const res = await api.get<BackendIdea[]>("/ideas");
        const raw: BackendIdea[] = Array.isArray(res.data) ? res.data : [];

        // member.accessible_ideas = [] means unrestricted (access to all)
        const accessibleIds = new Set(member.accessible_ideas.map((a) => a.id));
        const unrestricted = member.accessible_ideas.length === 0;

        const mapped: Idea[] = raw.map((idea) => ({
          id: idea.id,
          title: idea.title,
          status: idea.status,
          hasAccess: unrestricted || accessibleIds.has(idea.id),
        }));

        setIdeas(mapped);
        setAllIdeasEnabled(unrestricted || mapped.every((i) => i.hasAccess));
      } catch {
        toast.error("Failed to load ideas");
      } finally {
        setLoadingIdeas(false);
      }
    }
    loadIdeas();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredIdeas = ideas.filter((idea) =>
    idea.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleIdea = (ideaId: string) => {
    setIdeas((prev) => {
      const updated = prev.map((idea) =>
        idea.id === ideaId ? { ...idea, hasAccess: !idea.hasAccess } : idea
      );
      setAllIdeasEnabled(updated.every((i) => i.hasAccess));
      return updated;
    });
  };

  const handleToggleAllIdeas = (checked: boolean) => {
    setAllIdeasEnabled(checked);
    setIdeas((prev) => prev.map((idea) => ({ ...idea, hasAccess: checked })));
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const selectedIds = ideas.filter((i) => i.hasAccess).map((i) => i.id);
      // send null (no restriction) when all ideas are selected, otherwise send specific IDs
      const idea_ids = allIdeasEnabled ? [] : selectedIds;
      await api.patch(`/groups/${groupId}/members/${member.id}`, { idea_ids });
      toast.success("Idea access updated");
      onUpdated();
      onClose();
    } catch {
      toast.error("Failed to update idea access");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-0 max-h-[70vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-4 py-4 bg-slate-50 dark:bg-neutral-700 border-b border-slate-100 dark:border-neutral-600">
          <DialogTitle className="text-sm font-bold text-slate-800 dark:text-white">
            Idea Access — {member.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* All ideas toggle */}
          <div className="px-4 py-4 border-b border-slate-100 dark:border-neutral-600 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide">
                All Ideas
              </p>
              <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">
                Grant access to all current and future ideas
              </p>
            </div>
            <Switch
              checked={allIdeasEnabled}
              onCheckedChange={handleToggleAllIdeas}
              disabled={loadingIdeas}
              className="data-[state=checked]:bg-cyan-600 h-4 w-7 [&>[data-slot=switch-thumb]]:h-3 [&>[data-slot=switch-thumb]]:w-3 [&>[data-slot=switch-thumb]]:data-[state=checked]:translate-x-3"
            />
          </div>

          {/* Search */}
          <div className="px-2 pt-2 pb-0.5 border-b border-slate-100 dark:border-neutral-600">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ideas..."
                className="pl-8 py-2 text-xs rounded-[10px] border-slate-200 dark:border-neutral-600 bg-slate-50 dark:bg-neutral-700 dark:text-gray-200 focus:border-cyan-500 h-auto"
              />
            </div>
          </div>

          {/* Ideas list */}
          <div className="flex-1 overflow-y-auto">
            {loadingIdeas ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={20} className="animate-spin text-cyan-500" />
              </div>
            ) : filteredIdeas.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-slate-400 dark:text-gray-500">
                {search ? "No ideas match your search" : "No ideas found"}
              </div>
            ) : (
              filteredIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="px-4 py-3 border-b border-slate-50 dark:border-neutral-700 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                      {idea.title}
                    </p>
                    {idea.status && (
                      <p className="text-[10px] text-slate-500 dark:text-gray-400">
                        {idea.status}
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={idea.hasAccess}
                    onCheckedChange={() => handleToggleIdea(idea.id)}
                    className="data-[state=checked]:bg-cyan-600 shrink-0 h-4 w-7 [&>[data-slot=switch-thumb]]:h-3 [&>[data-slot=switch-thumb]]:w-3 [&>[data-slot=switch-thumb]]:data-[state=checked]:translate-x-3"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-3 bg-slate-50 dark:bg-neutral-700 border-t border-slate-100 dark:border-neutral-600 flex items-center justify-between gap-2">
          <p className="text-[10px] text-slate-400 dark:text-gray-500">
            {ideas.filter((i) => i.hasAccess).length} of {ideas.length} ideas accessible
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={saving}
              size="sm"
              className="text-slate-500 dark:text-gray-300 hover:bg-white dark:hover:bg-neutral-600 rounded-sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdate}
              disabled={saving || loadingIdeas}
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700 text-white border-0 rounded-sm"
            >
              {saving ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin" />
                  Saving…
                </span>
              ) : "Update Access"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface Idea {
  id: string;
  title: string;
  status: string;
  hasAccess: boolean;
}

interface IdeaAccessModalProps {
  member: Member;
  onClose: () => void;
}

const MOCK_IDEAS: Idea[] = [
  { id: "1", title: "AI Marketing Assistant", status: "Added 2 days ago", hasAccess: true },
  { id: "2", title: "Eco-Friendly Packaging", status: "In review", hasAccess: true },
  { id: "3", title: "Smart Fitness Tracker", status: "Experimental", hasAccess: false },
  { id: "4", title: "NFT Ticketing Platform", status: "New", hasAccess: false },
  { id: "5", title: "Personalized Skincare", status: "Discovery phase", hasAccess: true },
];

export function IdeaAccessModal({ member, onClose }: IdeaAccessModalProps) {
  const [search, setSearch] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>(MOCK_IDEAS);
  const [allIdeasEnabled, setAllIdeasEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredIdeas = ideas.filter((idea) =>
    idea.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleIdea = (ideaId: string) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === ideaId ? { ...idea, hasAccess: !idea.hasAccess } : idea
      )
    );
  };

  const handleToggleAllIdeas = (checked: boolean) => {
    setAllIdeasEnabled(checked);
    setIdeas((prev) => prev.map((idea) => ({ ...idea, hasAccess: checked })));
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-0 max-h-[70vh] flex flex-col overflow-hidden">
        <DialogHeader className="px-4 py-4 bg-slate-50 dark:bg-neutral-700 border-b border-slate-100 dark:border-neutral-600">
          <DialogTitle className="text-sm font-bold text-slate-800 dark:text-white">
            Idea Access
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* All ideas toggle */}
          <div className="px-4 py-4 border-b border-slate-100 dark:border-neutral-600 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide">
              All Ideas
            </p>
            <Switch
              checked={allIdeasEnabled}
              onCheckedChange={handleToggleAllIdeas}
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
            {filteredIdeas.map((idea) => (
              <div
                key={idea.id}
                className="px-4 py-3 border-b border-slate-50 dark:border-neutral-700 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                    {idea.title}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400">
                    {idea.status}
                  </p>
                </div>
                <Switch
                  checked={idea.hasAccess}
                  onCheckedChange={() => handleToggleIdea(idea.id)}
                  className="data-[state=checked]:bg-cyan-600 shrink-0 h-4 w-7 [&>[data-slot=switch-thumb]]:h-3 [&>[data-slot=switch-thumb]]:w-3 [&>[data-slot=switch-thumb]]:data-[state=checked]:translate-x-3"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-3 bg-slate-50 dark:bg-neutral-700 border-t border-slate-100 dark:border-neutral-600 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            size="sm"
            className="text-slate-500 dark:text-gray-300 hover:bg-white dark:hover:bg-neutral-600 rounded-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpdate}
            disabled={loading}
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700 text-white border-0 rounded-sm"
          >
            {loading ? "Updating" : "Update Access"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

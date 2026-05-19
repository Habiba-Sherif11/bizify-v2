"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";

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
  {
    id: "1",
    title: "AI Marketing Assistant",
    status: "Added 2 days ago",
    hasAccess: true,
  },
  {
    id: "2",
    title: "Eco-Friendly Packaging",
    status: "In review",
    hasAccess: true,
  },
  {
    id: "3",
    title: "Smart Fitness Tracker",
    status: "Experimental",
    hasAccess: false,
  },
  {
    id: "4",
    title: "NFT Ticketing Platform",
    status: "New",
    hasAccess: false,
  },
  {
    id: "5",
    title: "Personalized Skincare",
    status: "Discovery phase",
    hasAccess: true,
  },
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

  const handleToggleAllIdeas = () => {
    setAllIdeasEnabled(!allIdeasEnabled);
    setIdeas((prev) =>
      prev.map((idea) => ({ ...idea, hasAccess: !allIdeasEnabled }))
    );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-300/40 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl flex flex-col max-h-[70vh] overflow-hidden">
        <div className="px-4 py-4 bg-slate-50 dark:bg-neutral-700 border-b border-slate-100 dark:border-neutral-600 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Idea Access</h3>
          <button type="button" onClick={onClose} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors cursor-pointer">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="px-4 py-4 border-b border-slate-100 dark:border-neutral-600 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wide">All Ideas</p>
            <button type="button" onClick={handleToggleAllIdeas} className={`w-7 h-4 rounded-full transition-colors ${allIdeasEnabled ? "bg-cyan-600" : "bg-slate-200"} relative`}>
              <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${allIdeasEnabled ? "translate-x-3.5" : "translate-x-0.5"}`} />
            </button>
          </div>

          <div className="px-2 pt-2 pb-0.5 border-b border-slate-100 dark:border-neutral-600">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ideas..." className="w-full pl-8 pr-3 py-2 text-xs rounded-[10px] border border-slate-200 dark:border-neutral-600 bg-slate-50 dark:bg-neutral-700 text-gray-700 dark:text-gray-200 placeholder:text-gray-500 outline-none focus:border-cyan-500 transition-colors" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredIdeas.map((idea) => (
              <div key={idea.id} className="px-4 py-3 border-b border-slate-50 dark:border-neutral-700 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                    {idea.title}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-gray-400">
                    {idea.status}
                  </p>
                </div>
                <button type="button" onClick={() => handleToggleIdea(idea.id)} className={`w-7 h-4 rounded-full transition-colors shrink-0 ${idea.hasAccess ? "bg-cyan-600" : "bg-slate-200"} relative`}>
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${idea.hasAccess ? "translate-x-3.5" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="px-3 py-3 bg-slate-50 dark:bg-neutral-700 border-t border-slate-100 dark:border-neutral-600 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} disabled={loading} className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-gray-300 hover:bg-white dark:hover:bg-neutral-600 rounded-sm cursor-pointer disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={handleUpdate} disabled={loading} className="px-4 py-2 bg-cyan-600 text-white text-xs font-medium rounded-sm cursor-pointer disabled:opacity-50">
            {loading ? "Updating" : "Update Access"}
          </button>
        </div>
      </div>
    </div>
  );
}

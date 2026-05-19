"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateIdeaPayload } from "@/features/entrepreneur/types/idea";

interface Props {
  onClose: () => void;
  onCreate: (payload: CreateIdeaPayload) => Promise<void>;
}

export function CreateIdeaModal({ onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onCreate({ title: title.trim(), description: description.trim() });
      onClose();
    } catch {
      setError("Failed to create idea. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create new idea</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form id="create-idea-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Art Marketplace for Egyptian Creators"
              autoFocus
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 outline-none focus:border-cyan-400 dark:focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem you're solving, who it's for, and your initial approach…"
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 outline-none focus:border-cyan-400 dark:focus:border-cyan-500 transition-colors resize-none"
            />
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Once saved, the AI pipeline will generate budget estimates, feasibility scores, and required skills automatically.
          </p>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-idea-form"
            disabled={isSubmitting}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium text-white transition-opacity cursor-pointer",
              "bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_12px_rgba(255,183,3,0.3)]",
              isSubmitting && "opacity-60 cursor-not-allowed"
            )}
          >
            {isSubmitting ? "Creating…" : "Create idea"}
          </button>
        </div>
      </div>
    </div>
  );
}

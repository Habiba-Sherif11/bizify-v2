"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const submittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }
    submittingRef.current = true;
    setError(null);
    setIsSubmitting(true);
    try {
      await onCreate({ title: title.trim(), description: description.trim() });
      onClose();
    } catch {
      setError("Failed to create idea. Please try again.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create new idea</DialogTitle>
        </DialogHeader>

        <form id="create-idea-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="idea-title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="idea-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Art Marketplace for Egyptian Creators"
              autoFocus
              className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-200 focus:border-cyan-400 dark:focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="idea-description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="idea-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem you're solving, who it's for, and your initial approach…"
              rows={4}
              className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-gray-200 focus:border-cyan-400 dark:focus:border-cyan-500"
            />
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Once saved, the AI pipeline will generate budget estimates, feasibility scores, and required skills automatically.
          </p>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-idea-form"
            disabled={isSubmitting}
            variant="primary-gradient"
            className={cn(isSubmitting && "opacity-60")}
          >
            {isSubmitting ? "Creating…" : "Create idea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

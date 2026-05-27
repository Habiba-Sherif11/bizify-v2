"use client";

import { useState, useCallback } from "react";
import { api } from "@/features/auth/lib/api";
import type { Idea, CreateIdeaPayload, IdeaFilters } from "@/features/entrepreneur/types/idea";

export function formatIdeaDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [archivedIdeas, setArchivedIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isArchiveLoading, setIsArchiveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIdeas = useCallback(async (filters?: IdeaFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters?.min_budget != null) params.set("min_budget", String(filters.min_budget));
      if (filters?.max_budget != null) params.set("max_budget", String(filters.max_budget));
      if (filters?.skills) params.set("skills", filters.skills);
      if (filters?.feasibility != null) params.set("feasibility", String(filters.feasibility));
      if (filters?.domain) params.set("domain", filters.domain);
      if (filters?.sort_by) params.set("sort_by", filters.sort_by);
      if (filters?.sort_order) params.set("sort_order", filters.sort_order);

      const url = params.toString() ? `/ideas?${params.toString()}` : "/ideas";
      const { data } = await api.get(url);
      setIdeas(Array.isArray(data) ? data : data.items ?? []);
    } catch {
      setError("Failed to load ideas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchArchivedIdeas = useCallback(async () => {
    setIsArchiveLoading(true);
    try {
      const { data } = await api.get("/ideas/archived");
      setArchivedIdeas(Array.isArray(data) ? data : data.items ?? []);
    } catch {
      setArchivedIdeas([]);
    } finally {
      setIsArchiveLoading(false);
    }
  }, []);

  const createIdea = useCallback(async (payload: CreateIdeaPayload): Promise<Idea> => {
    const { data } = await api.post("/ideas", payload);
    setIdeas((prev) => [data, ...prev]);
    return data as Idea;
  }, []);

  const archiveIdea = useCallback(async (id: string) => {
    await api.patch(`/ideas/${id}/archive`);
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
  }, []);

  const unarchiveIdea = useCallback(async (id: string) => {
    const { data } = await api.patch(`/ideas/${id}/unarchive`);
    setArchivedIdeas((prev) => prev.filter((idea) => idea.id !== id));
    setIdeas((prev) => [data as Idea, ...prev]);
  }, []);

  return {
    ideas,
    archivedIdeas,
    isLoading,
    isArchiveLoading,
    error,
    fetchIdeas,
    fetchArchivedIdeas,
    createIdea,
    archiveIdea,
    unarchiveIdea,
  };
}

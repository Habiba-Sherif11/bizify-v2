"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/features/auth/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SectionKey =
  | "customers"
  | "competition"
  | "marketPotential"
  | "ideaStrategy"
  | "businessModel"
  | "functionsList"
  | "mvpPlanning"
  | "unitEconomics"
  | "goToMarket"
  | "problems"
  | "idea";

export interface SectionState {
  data: string | null;
  isLoading: boolean;
  error: string | null;
}

export type PipelineSections = Record<SectionKey, SectionState>;

const SECTION_ENDPOINTS: Record<SectionKey, string> = {
  customers:       "/ai/customers",
  competition:     "/ai/competition",
  marketPotential: "/ai/market-potential",
  ideaStrategy:    "/ai/idea-strategy",
  businessModel:   "/ai/business-model",
  functionsList:   "/ai/functions-list",
  mvpPlanning:     "/ai/mvp-planning",
  unitEconomics:   "/ai/unit-economics",
  goToMarket:      "/ai/go-to-market",
  problems:        "/ai/problems",
  idea:            "/ai/idea",
};

// Maps each section key to the field name returned in the backend response.
// GET /api/v1/ai/idea          → { current_idea: string, ... }
// GET /api/v1/ai/customers     → { customers: {...}, ... }
// GET /api/v1/ai/market-potential → { market_potential: {...}, ... }
const SECTION_RESPONSE_KEYS: Record<SectionKey, string> = {
  idea:            "current_idea",
  customers:       "customers",
  competition:     "competition",
  marketPotential: "market_potential",
  ideaStrategy:    "idea_strategy",
  businessModel:   "business_model",
  functionsList:   "functions_list",
  mvpPlanning:     "mvp_planning",
  unitEconomics:   "unit_economics",
  goToMarket:      "go_to_market",
  problems:        "problems",
};

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS  = 5 * 60 * 1_000; // 5 minutes

const EMPTY_SECTION: SectionState = { data: null, isLoading: false, error: null };

function emptyPipeline(): PipelineSections {
  return Object.fromEntries(
    Object.keys(SECTION_ENDPOINTS).map((k) => [k, { ...EMPTY_SECTION }])
  ) as PipelineSections;
}

function extractSectionText(key: SectionKey, data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const responseKey = SECTION_RESPONSE_KEYS[key];
  const d = data as Record<string, unknown>;
  const value = d[responseKey];
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAiPipeline(ideaId?: string) {
  const [sections, setSections] = useState<PipelineSections>(emptyPipeline);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const setSection = useCallback((key: SectionKey, patch: Partial<SectionState>) => {
    setSections((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }, []);

  const fetchSection = useCallback(
    async (key: SectionKey) => {
      setSection(key, { isLoading: true, error: null });
      try {
        const params = ideaId ? { idea_id: ideaId } : undefined;
        const { data } = await api.get(SECTION_ENDPOINTS[key], { params });
        const text = extractSectionText(key, data);
        setSection(key, { data: text || null, isLoading: false });
      } catch {
        setSection(key, { isLoading: false, error: "Failed to load this section." });
      }
    },
    [setSection, ideaId]
  );

  const fetchAll = useCallback(async () => {
    await Promise.allSettled(
      (Object.keys(SECTION_ENDPOINTS) as SectionKey[]).map((key) => fetchSection(key))
    );
  }, [fetchSection]);

  // Poll GET /ai/status until pipeline_complete or timeout, then fetch all sections.
  const pollUntilDone = useCallback(async (): Promise<void> => {
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      try {
        const { data } = await api.get("/ai/status");
        if (data?.status === "error") {
          throw new Error(data.error ?? "Pipeline encountered an error");
        }
        // Fetch sections as they become ready, not just at the end
        if (data?.idea_ready)              fetchSection("idea").catch(() => {});
        if (data?.customers_ready)         fetchSection("customers").catch(() => {});
        if (data?.competition_ready)       fetchSection("competition").catch(() => {});
        if (data?.market_potential_ready)  fetchSection("marketPotential").catch(() => {});
        if (data?.idea_strategy_ready)     fetchSection("ideaStrategy").catch(() => {});
        if (data?.business_model_ready)    fetchSection("businessModel").catch(() => {});
        if (data?.functions_list_ready)    fetchSection("functionsList").catch(() => {});
        if (data?.mvp_planning_ready)      fetchSection("mvpPlanning").catch(() => {});
        if (data?.unit_economics_ready)    fetchSection("unitEconomics").catch(() => {});
        if (data?.go_to_market_ready)      fetchSection("goToMarket").catch(() => {});
        if (data?.problems_ready)          fetchSection("problems").catch(() => {});

        if (data?.pipeline_complete || data?.status === "done") {
          return;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Pipeline error";
        throw new Error(msg);
      }
    }
    throw new Error("Pipeline timed out after 5 minutes. Please try again.");
  }, [fetchSection]);

  const runPipeline = useCallback(async () => {
    setIsRunning(true);
    setRunError(null);
    try {
      // POST /ai/run returns 202 immediately — pipeline runs async on backend
      await api.post("/ai/run", ideaId ? { idea_id: ideaId } : {}, { timeout: 30_000 });
      // Poll status and incrementally fetch sections as they complete
      await pollUntilDone();
      setHasRun(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Pipeline failed to start.";
      setRunError(msg);
    } finally {
      setIsRunning(false);
    }
  }, [pollUntilDone]);

  // Auto-load existing sections when the page first mounts
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch sections when general chat runs an analysis (same-tab CustomEvent)
  useEffect(() => {
    const handler = () => { fetchAll(); };
    window.addEventListener("bizify:sections_updated", handler);
    return () => window.removeEventListener("bizify:sections_updated", handler);
  }, [fetchAll]);

  return {
    sections,
    isRunning,
    hasRun,
    runError,
    runPipeline,
    fetchSection,
    fetchAll,
  };
}

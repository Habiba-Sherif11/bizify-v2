"use client";

import { useState, useCallback } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ValidationMode = "generic" | "bizify";

export interface FactEvidence {
  source: string;
  url: string;
  date: string;
}

export interface FactIssue {
  claim: string;
  status: "supported" | "outdated" | "incorrect" | "unverified";
  evidence: FactEvidence[];
}

export interface WeakPoint {
  point: string;
  suggestion: string;
}

export interface ValidationScores {
  completeness: number;
  accuracy: number;
  depth: number;
  structure: number;
}

export interface ValidationScoreReasoning {
  completeness: string;
  accuracy: string;
  depth: string;
  structure: string;
}

export interface ImprovedContent {
  summary: string;
  key_improvements: string[];
  full_analysis: string;
}

export interface ValidationResult {
  validation_id: string;
  section: string;
  section_name: string;
  validation_mode: ValidationMode;
  scores: ValidationScores;
  score_reasoning: ValidationScoreReasoning;
  missing_elements: string[];
  weak_points: WeakPoint[];
  fact_issues: FactIssue[];
  improvement_suggestions: string[];
  missing_vs_bizify: string[];
  improved_content: ImprovedContent;
  improved_pdf_b64: string;
  // special-case flags
  section_mismatch?: boolean;
  predicted_section?: string;
  needs_generation?: boolean;
  message?: string;
}

export interface ValidationHistoryItem {
  validation_id: string;
  section: string;
  validation_mode: ValidationMode;
  scores: ValidationScores | null;
  section_mismatch: boolean;
  created_at: string;
}

interface ValidationState {
  isLoading: boolean;
  error: string | null;
  result: ValidationResult | null;
  history: ValidationHistoryItem[];
  historyLoading: boolean;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useValidation(sectionSlug: string, ideaId: string) {
  const [state, setState] = useState<ValidationState>({
    isLoading: false,
    error: null,
    result: null,
    history: [],
    historyLoading: false,
  });

  const validate = useCallback(
    async (file: File, mode: ValidationMode) => {
      setState((s) => ({ ...s, isLoading: true, error: null, result: null }));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("validation_mode", mode);
      if (ideaId) formData.append("idea_id", ideaId);

      try {
        const res = await fetch(`/api/ai/${sectionSlug}/validate`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || data?.detail || "Validation failed");
        }

        setState((s) => ({ ...s, isLoading: false, result: data }));
        return data as ValidationResult;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Validation failed";
        setState((s) => ({ ...s, isLoading: false, error: msg }));
        return null;
      }
    },
    [sectionSlug, ideaId]
  );

  const fetchHistory = useCallback(async () => {
    setState((s) => ({ ...s, historyLoading: true }));
    try {
      const url = `/api/ai/${sectionSlug}/validate${ideaId ? `?idea_id=${ideaId}` : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setState((s) => ({
          ...s,
          historyLoading: false,
          history: data.validations || [],
        }));
      } else {
        setState((s) => ({ ...s, historyLoading: false }));
      }
    } catch {
      setState((s) => ({ ...s, historyLoading: false }));
    }
  }, [sectionSlug, ideaId]);

  const fetchResult = useCallback(async (validationId: string) => {
    try {
      const res = await fetch(`/api/ai/validate/result/${validationId}`);
      if (res.ok) {
        const data = await res.json();
        setState((s) => ({ ...s, result: data }));
      }
    } catch {
      // ignore
    }
  }, []);

  const downloadPdf = useCallback((b64: string, sectionName: string) => {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bizify-improved-${sectionName}-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const clearResult = useCallback(() => {
    setState((s) => ({ ...s, result: null, error: null }));
  }, []);

  return {
    ...state,
    validate,
    fetchHistory,
    fetchResult,
    downloadPdf,
    clearResult,
  };
}

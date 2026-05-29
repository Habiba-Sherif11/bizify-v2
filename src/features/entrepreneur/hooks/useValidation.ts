"use client";

import { useState, useCallback, useEffect, useRef } from "react";

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
  replacement_suggestion?: string;
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

export interface ChangeLogEntry {
  original: string;
  improved: string;
}

export interface ChangeLog {
  added: string[];
  modified: ChangeLogEntry[];
  removed: string[];
}

export interface ValidationResult {
  validation_id: string;
  section: string;
  section_name: string;
  validation_mode: ValidationMode;
  file_name: string;
  scores: ValidationScores;
  score_reasoning: ValidationScoreReasoning;
  overall_score: number;
  missing_elements: string[];
  weak_points: WeakPoint[];
  fact_issues: FactIssue[];
  improvement_suggestions: string[];
  missing_vs_bizify: string[];
  improved_content: ImprovedContent;
  improved_pdf_b64: string;
  improved_docx_b64: string;
  change_log: ChangeLog | null;
  created_at: string;
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
  file_name: string;
  scores: ValidationScores | null;
  overall_score: number | null;
  section_mismatch: boolean;
  created_at: string;
}

// ─── Per-mode state ────────────────────────────────────────────────────────────

interface ModeState {
  isLoading: boolean;
  error: string | null;
  result: ValidationResult | null;
}

const initialModeState = (): ModeState => ({
  isLoading: false,
  error: null,
  result: null,
});

interface ValidationState {
  generic: ModeState;
  bizify: ModeState;
  history: ValidationHistoryItem[];
  historyLoading: boolean;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useValidation(sectionSlug: string, ideaId: string) {
  const [state, setState] = useState<ValidationState>({
    generic: initialModeState(),
    bizify: initialModeState(),
    history: [],
    historyLoading: false,
  });

  // Track whether we've loaded from DB on mount
  const initialized = useRef(false);

  // ── Persist results from DB on mount ────────────────────────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function loadFromDb() {
      setState((s) => ({ ...s, historyLoading: true }));
      try {
        const url = `/api/ai/${sectionSlug}/validate${ideaId ? `?idea_id=${ideaId}` : ""}`;
        const res = await fetch(url);
        if (!res.ok) {
          setState((s) => ({ ...s, historyLoading: false }));
          return;
        }
        const data = await res.json();
        const items: ValidationHistoryItem[] = data.validations || [];

        setState((s) => ({
          ...s,
          history: items,
          historyLoading: false,
        }));

        // Load the latest result for each mode
        for (const mode of ["generic", "bizify"] as ValidationMode[]) {
          const latest = items.find(
            (h) => h.validation_mode === mode && !h.section_mismatch
          );
          if (latest) {
            try {
              const rRes = await fetch(
                `/api/ai/validate/result/${latest.validation_id}`
              );
              if (rRes.ok) {
                const rData = await rRes.json();
                setState((s) => ({
                  ...s,
                  [mode]: { ...s[mode], result: rData as ValidationResult },
                }));
              }
            } catch {
              // Non-fatal — if result can't be loaded, show empty state
            }
          }
        }
      } catch {
        setState((s) => ({ ...s, historyLoading: false }));
      }
    }

    loadFromDb();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionSlug, ideaId]);

  // ── Validate (upload PDF) ─────────────────────────────────────────────────
  const validate = useCallback(
    async (file: File, mode: ValidationMode) => {
      setState((s) => ({
        ...s,
        [mode]: { isLoading: true, error: null, result: null },
      }));

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

        const result = data as ValidationResult;
        setState((s) => ({
          ...s,
          [mode]: { isLoading: false, error: null, result },
          // Prepend new history item
          history: [
            {
              validation_id:   result.validation_id,
              section:         result.section,
              validation_mode: mode,
              file_name:       result.file_name || file.name,
              scores:          result.scores || null,
              overall_score:   result.overall_score ?? null,
              section_mismatch:!!result.section_mismatch,
              created_at:      result.created_at || new Date().toISOString(),
            },
            ...s.history.filter((h) => h.validation_id !== result.validation_id),
          ],
        }));
        return result;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Validation failed";
        setState((s) => ({
          ...s,
          [mode]: { isLoading: false, error: msg, result: null },
        }));
        return null;
      }
    },
    [sectionSlug, ideaId]
  );

  // ── Load a specific historical result into a mode slot ─────────────────────
  const fetchResult = useCallback(
    async (validationId: string, mode: ValidationMode) => {
      setState((s) => ({ ...s, [mode]: { ...s[mode], isLoading: true, error: null } }));
      try {
        const res = await fetch(`/api/ai/validate/result/${validationId}`);
        if (res.ok) {
          const data = await res.json();
          setState((s) => ({
            ...s,
            [mode]: { isLoading: false, error: null, result: data as ValidationResult },
          }));
        } else {
          const err = await res.json().catch(() => ({}));
          const msg = (err as { error?: string }).error || `Failed to load result (${res.status})`;
          setState((s) => ({ ...s, [mode]: { ...s[mode], isLoading: false, error: msg } }));
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load result";
        setState((s) => ({ ...s, [mode]: { ...s[mode], isLoading: false, error: msg } }));
      }
    },
    []
  );

  // ── Clear a single mode's result ──────────────────────────────────────────
  const clearResult = useCallback((mode: ValidationMode) => {
    setState((s) => ({
      ...s,
      [mode]: { ...s[mode], result: null, error: null },
    }));
  }, []);

  // ── Download helpers ──────────────────────────────────────────────────────
  const triggerDownload = useCallback((b64: string, filename: string, mimeType: string) => {
    if (!b64) return;
    try {
      const clean = b64.replace(/\s/g, "");
      const binary = atob(clean);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 200);
    } catch (err) {
      console.error("Download failed:", err);
    }
  }, []);

  const downloadPdf = useCallback((b64: string, sectionName: string) => {
    triggerDownload(b64, `bizify-improved-${sectionName}-${Date.now()}.pdf`, "application/pdf");
  }, [triggerDownload]);

  const downloadDocx = useCallback((b64: string, sectionName: string) => {
    triggerDownload(
      b64,
      `bizify-improved-${sectionName}-${Date.now()}.docx`,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
  }, [triggerDownload]);

  return {
    // Per-mode
    genericResult:   state.generic.result,
    genericLoading:  state.generic.isLoading,
    genericError:    state.generic.error,
    bizifyResult:    state.bizify.result,
    bizifyLoading:   state.bizify.isLoading,
    bizifyError:     state.bizify.error,
    // History
    history:         state.history,
    historyLoading:  state.historyLoading,
    // Actions
    validate,
    fetchResult,
    clearResult,
    downloadPdf,
    downloadDocx,
  };
}

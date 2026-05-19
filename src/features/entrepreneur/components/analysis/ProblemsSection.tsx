"use client";

import { AlertTriangle } from "lucide-react";
import { AiAnalysisSection } from "@/features/entrepreneur/components/AiAnalysisSection";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

export function ProblemsSection({ data, isLoading, error }: SectionState) {
  return (
    <AiAnalysisSection
      title="Problems"
      icon={<AlertTriangle size={16} />}
      data={data}
      isLoading={isLoading}
      error={error}
    />
  );
}

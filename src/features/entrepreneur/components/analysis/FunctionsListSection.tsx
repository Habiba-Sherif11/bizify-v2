"use client";

import { ListChecks } from "lucide-react";
import { AiAnalysisSection } from "@/features/entrepreneur/components/AiAnalysisSection";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

export function FunctionsListSection({ data, isLoading, error }: SectionState) {
  return (
    <AiAnalysisSection
      title="Functions List"
      icon={<ListChecks size={16} />}
      data={data}
      isLoading={isLoading}
      error={error}
    />
  );
}

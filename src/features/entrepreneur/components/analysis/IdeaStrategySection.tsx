"use client";

import { Lightbulb } from "lucide-react";
import { AiAnalysisSection } from "@/features/entrepreneur/components/AiAnalysisSection";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

export function IdeaStrategySection({ data, isLoading, error }: SectionState) {
  return (
    <AiAnalysisSection
      title="Idea Strategy"
      icon={<Lightbulb size={16} />}
      data={data}
      isLoading={isLoading}
      error={error}
    />
  );
}

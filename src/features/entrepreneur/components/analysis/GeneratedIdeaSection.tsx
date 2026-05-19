"use client";

import { Sparkles } from "lucide-react";
import { AiAnalysisSection } from "@/features/entrepreneur/components/AiAnalysisSection";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

export function GeneratedIdeaSection({ data, isLoading, error }: SectionState) {
  return (
    <AiAnalysisSection
      title="Generated Idea"
      icon={<Sparkles size={16} />}
      data={data}
      isLoading={isLoading}
      error={error}
    />
  );
}

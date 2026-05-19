"use client";

import { Briefcase } from "lucide-react";
import { AiAnalysisSection } from "@/features/entrepreneur/components/AiAnalysisSection";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

export function BusinessModelSection({ data, isLoading, error }: SectionState) {
  return (
    <AiAnalysisSection
      title="Business Model"
      icon={<Briefcase size={16} />}
      data={data}
      isLoading={isLoading}
      error={error}
    />
  );
}

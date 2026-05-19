"use client";

import { Rocket } from "lucide-react";
import { AiAnalysisSection } from "@/features/entrepreneur/components/AiAnalysisSection";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

export function MvpPlanningSection({ data, isLoading, error }: SectionState) {
  return (
    <AiAnalysisSection
      title="MVP Planning"
      icon={<Rocket size={16} />}
      data={data}
      isLoading={isLoading}
      error={error}
    />
  );
}

"use client";

import { Swords } from "lucide-react";
import { AiAnalysisSection } from "@/features/entrepreneur/components/AiAnalysisSection";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

export function CompetitionSection({ data, isLoading, error }: SectionState) {
  return (
    <AiAnalysisSection
      title="Competition"
      icon={<Swords size={16} />}
      data={data}
      isLoading={isLoading}
      error={error}
    />
  );
}

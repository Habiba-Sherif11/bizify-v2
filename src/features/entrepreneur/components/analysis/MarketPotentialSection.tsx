"use client";

import { BarChart2 } from "lucide-react";
import { AiAnalysisSection } from "@/features/entrepreneur/components/AiAnalysisSection";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

export function MarketPotentialSection({ data, isLoading, error }: SectionState) {
  return (
    <AiAnalysisSection
      title="Market Potential"
      icon={<BarChart2 size={16} />}
      data={data}
      isLoading={isLoading}
      error={error}
    />
  );
}

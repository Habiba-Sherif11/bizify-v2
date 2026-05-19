"use client";

import { DollarSign } from "lucide-react";
import { AiAnalysisSection } from "@/features/entrepreneur/components/AiAnalysisSection";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

export function UnitEconomicsSection({ data, isLoading, error }: SectionState) {
  return (
    <AiAnalysisSection
      title="Unit Economics"
      icon={<DollarSign size={16} />}
      data={data}
      isLoading={isLoading}
      error={error}
    />
  );
}

"use client";

import { Megaphone } from "lucide-react";
import { AiAnalysisSection } from "@/features/entrepreneur/components/AiAnalysisSection";
import type { SectionState } from "@/features/entrepreneur/hooks/useAiPipeline";

export function GoToMarketSection({ data, isLoading, error }: SectionState) {
  return (
    <AiAnalysisSection
      title="Go-to-Market Strategy"
      icon={<Megaphone size={16} />}
      data={data}
      isLoading={isLoading}
      error={error}
    />
  );
}

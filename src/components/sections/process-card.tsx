"use client";

// Internal components
import { Card } from "@/components/ui/card";

// Types
interface Step {
  id: number;
  title: string;
  description: string;
}

interface ProcessCardProps {
  step: Step;
}

export function ProcessCard({ step }: ProcessCardProps) {
  return (
    <Card className="p-4 sm:p-5 border border-white/70 bg-white/60 backdrop-blur-md shadow-sm transition-colors duration-200 hover:bg-white/70">
      {/* Step Number Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-amber-50 px-2.5 py-1 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">Step</span>
        <span className="text-xs font-semibold text-neutral-900">
          {String(step.id).padStart(2, "0")}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-neutral-950 mb-1.5">{step.title}</h3>

      {/* Description */}
      <p className="text-neutral-600 text-xs leading-relaxed">{step.description}</p>
    </Card>
  );
}
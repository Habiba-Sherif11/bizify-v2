"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function ChoiceButton({ label, selected, onClick, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all",
        selected
          ? "bg-cyan-50 border-2 border-cyan-500 text-cyan-700"
          : "bg-white border border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50/60",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {selected && <Check size={13} className="shrink-0 text-cyan-600" strokeWidth={2.5} />}
      {label}
    </button>
  );
}

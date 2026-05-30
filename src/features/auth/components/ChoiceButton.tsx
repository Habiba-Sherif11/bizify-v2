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
        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150",
        selected
          ? "bg-amber-50 border-2 border-amber-400 text-amber-800"
          : "bg-white border border-[#E9E9E9] text-[#1C1C1E] hover:border-amber-300 hover:bg-amber-50/60",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {selected && <Check size={12} className="shrink-0 text-amber-600" strokeWidth={2.5} />}
      {label}
    </button>
  );
}

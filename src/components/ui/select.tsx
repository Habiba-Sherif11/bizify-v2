"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({ value, onChange, options, placeholder, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center justify-between gap-2 w-full",
          "pl-3 pr-2.5 py-2 text-sm rounded-lg",
          "bg-white dark:bg-neutral-800",
          "border border-neutral-200 dark:border-neutral-700",
          "text-gray-700 dark:text-gray-200",
          "cursor-pointer transition-colors",
          "focus:outline-none",
          open
            ? "border-cyan-400 dark:border-cyan-500"
            : "hover:border-neutral-300 dark:hover:border-neutral-600"
        )}
      >
        <span className={cn(!selected && "text-gray-400 dark:text-gray-500")}>
          {selected?.label ?? placeholder ?? "Select…"}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-gray-400 shrink-0 transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className={cn(
          "absolute top-full mt-1 z-50",
          "min-w-full w-max",
          "bg-white dark:bg-neutral-800",
          "border border-neutral-200 dark:border-neutral-700",
          "rounded-lg shadow-lg",
          "py-1 overflow-hidden",
          "animate-in fade-in slide-in-from-top-1 duration-100"
        )}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => { onChange(option.value); setOpen(false); }}
              className={cn(
                "w-full flex items-center justify-between gap-6",
                "px-3 py-2 text-sm text-left whitespace-nowrap",
                "transition-colors cursor-pointer",
                value === option.value
                  ? "text-cyan-600 dark:text-cyan-400 font-medium bg-cyan-50 dark:bg-cyan-900/20"
                  : "text-gray-700 dark:text-gray-200 hover:bg-neutral-50 dark:hover:bg-neutral-700"
              )}
            >
              {option.label}
              {value === option.value && (
                <Check size={13} className="text-cyan-600 dark:text-cyan-400 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

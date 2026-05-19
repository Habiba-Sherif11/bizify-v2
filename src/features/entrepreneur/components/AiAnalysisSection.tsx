"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AiAnalysisSectionProps {
  title: string;
  icon: React.ReactNode;
  data: string | null;
  isLoading: boolean;
  error: string | null;
  emptyHint?: string;
}

export function AiAnalysisSection({
  title,
  icon,
  data,
  isLoading,
  error,
  emptyHint = "Run the pipeline to generate this analysis.",
}: AiAnalysisSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Section title */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>

      {/* Card */}
      <div className={cn(
        "rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800",
        "min-h-48 p-5"
      )}>
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} />
        ) : data ? (
          <AnalysisContent text={data} />
        ) : (
          <EmptyState hint={emptyHint} />
        )}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {[80, 95, 70, 85, 60].map((w, i) => (
        <div
          key={i}
          className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-700"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 text-red-500">
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function EmptyState({ hint }: { hint: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-36">
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center">{hint}</p>
    </div>
  );
}

// Recursively render a JSON value in a clean, readable way
function JsonValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 dark:text-gray-500 italic">—</span>;
  }

  if (typeof value === "boolean") {
    return <span className={value ? "text-green-600 dark:text-green-400" : "text-red-500"}>{String(value)}</span>;
  }

  if (typeof value === "number") {
    return <span className="text-amber-600 dark:text-amber-400">{value}</span>;
  }

  if (typeof value === "string") {
    return <span className="text-gray-700 dark:text-gray-200">{value}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-400 italic">empty</span>;

    // Array of primitives → compact pill list
    if (value.every((v) => typeof v !== "object" || v === null)) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-xs text-gray-700 dark:text-gray-200"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    // Array of objects → render each as a card
    return (
      <div className="flex flex-col gap-3">
        {value.map((item, i) => (
          <div key={i} className="rounded-lg border border-neutral-100 dark:border-neutral-700 p-3 bg-neutral-50 dark:bg-neutral-900/40">
            <JsonValue value={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, v]) => v !== null && v !== undefined && v !== ""
    );
    if (entries.length === 0) return null;

    return (
      <div className={cn("flex flex-col gap-3", depth > 0 && "gap-2")}>
        {entries.map(([key, val]) => (
          <div key={key} className={cn("flex flex-col gap-1", depth > 0 && "gap-0.5")}>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              {key.replace(/_/g, " ")}
            </p>
            <div className={cn("text-sm", depth > 0 && "pl-2")}>
              <JsonValue value={val} depth={depth + 1} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-gray-700 dark:text-gray-200">{String(value)}</span>;
}

function AnalysisContent({ text }: { text: string }) {
  // Try to parse as JSON first
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === "object") {
      return (
        <div className="text-sm">
          <JsonValue value={parsed} />
        </div>
      );
    }
  } catch {
    // Not JSON — fall through to plain text
  }

  // Plain text (e.g. the `idea` section returns a formatted text string)
  return (
    <pre className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
      {text}
    </pre>
  );
}

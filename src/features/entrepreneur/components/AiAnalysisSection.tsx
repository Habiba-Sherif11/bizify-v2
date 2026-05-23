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
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>

      <div className={cn(
        "rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800",
        "min-h-48 p-5"
      )}>
        {isLoading ? (
          <LoadingSkeleton />
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

function LoadingSkeleton() {
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

// ─── Inline markdown: **bold**, *italic* ──────────────────────────────────────

function MarkdownInline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i} className="font-semibold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*"))
          return <em key={i} className="italic">{part.slice(1, -1)}</em>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ─── Block markdown renderer ──────────────────────────────────────────────────

function MarkdownBlock({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trimEnd();

    if (!line.trim()) { i++; continue; }

    // Headings: # / ## / ###
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      const cls = level === 1
        ? "text-base font-bold text-gray-900 dark:text-white mt-5 mb-1 first:mt-0"
        : level === 2
          ? "text-sm font-semibold text-gray-800 dark:text-gray-100 mt-4 mb-0.5 first:mt-0"
          : "text-sm font-medium text-gray-700 dark:text-gray-200 mt-3 mb-0.5 first:mt-0";
      elements.push(<p key={key++} className={cls}>{content}</p>);
      i++;
      continue;
    }

    // Bullet list: -, *, •
    if (/^[-*•]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i].trimEnd())) {
        items.push(lines[i].replace(/^[-*•]\s/, ""));
        i++;
      }
      elements.push(
        <ul key={key++} className="flex flex-col gap-1.5 my-2">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span><MarkdownInline text={item} /></span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list: 1. 2. …
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trimEnd())) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      elements.push(
        <ol key={key++} className="flex flex-col gap-1.5 my-2">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <span className="mt-0.5 min-w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                {j + 1}
              </span>
              <span><MarkdownInline text={item} /></span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph: collect consecutive non-special lines
    const paraLines: string[] = [];
    while (i < lines.length) {
      const l = lines[i].trimEnd();
      if (!l.trim() || /^[#\-*•]/.test(l) || /^\d+\./.test(l)) break;
      paraLines.push(l);
      i++;
    }
    if (paraLines.length) {
      elements.push(
        <p key={key++} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <MarkdownInline text={paraLines.join(" ")} />
        </p>
      );
    }
  }

  return <div className="flex flex-col gap-2">{elements}</div>;
}

// ─── JSON value renderer ──────────────────────────────────────────────────────

function JsonValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 dark:text-gray-500 italic">—</span>;
  }

  if (typeof value === "boolean") {
    return <span className={value ? "text-green-600 dark:text-green-400" : "text-red-500"}>{String(value)}</span>;
  }

  if (typeof value === "number") {
    return <span className="text-amber-600 dark:text-amber-400 font-medium">{value}</span>;
  }

  if (typeof value === "string") {
    // Render markdown if the string has any markdown markers or newlines
    if (/[\n\r]|(\*\*)|(^|\s)[*#\-•]/.test(value) || value.length > 120) {
      return <MarkdownBlock text={value} />;
    }
    return <span className="text-gray-700 dark:text-gray-200">{value}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-400 italic text-xs">—</span>;

    // Array of primitives → pill tags
    if (value.every((v) => typeof v !== "object" || v === null)) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-700 text-xs text-gray-700 dark:text-gray-200 border border-neutral-200 dark:border-neutral-600"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    // Array of objects → cards
    return (
      <div className="flex flex-col gap-3">
        {value.map((item, i) => (
          <div key={i} className="rounded-lg border border-neutral-100 dark:border-neutral-700 p-4 bg-neutral-50 dark:bg-neutral-900/40">
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
      <div className={cn("flex flex-col gap-4", depth > 0 && "gap-3")}>
        {entries.map(([key, val]) => (
          <div key={key} className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {key.replace(/_/g, " ")}
            </p>
            <div className={cn("text-sm", depth > 0 && "pl-1")}>
              <JsonValue value={val} depth={depth + 1} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-gray-700 dark:text-gray-200">{String(value)}</span>;
}

// ─── Main content renderer ────────────────────────────────────────────────────

function AnalysisContent({ text }: { text: string }) {
  // Try JSON first — backend returns objects for all sections except /ai/idea
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
    // not JSON — treat as markdown/plain text
  }

  return <MarkdownBlock text={text} />;
}

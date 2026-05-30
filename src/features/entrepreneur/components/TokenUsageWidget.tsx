"use client";

import { useEffect, useState } from "react";
import { Zap, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/features/auth/lib/api";

interface UsageData {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  unlimited: boolean;
  plan_name: string;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function getBarColor(pct: number): string {
  if (pct >= 90) return "#ef4444";
  if (pct >= 70) return "#f97316";
  return "#22c55e";
}

export function TokenUsageWidget() {
  const router = useRouter();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/usage")
      .then(({ data }) => setUsage(data))
      .catch(() => setUsage(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 animate-pulse">
        <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded mb-3" />
        <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-700 rounded-full mb-2" />
        <div className="h-3 w-32 bg-neutral-100 dark:bg-neutral-700 rounded" />
      </div>
    );
  }

  if (!usage) return null;

  const pct = usage.unlimited ? 0 : Math.min(usage.percentage, 100);
  const barColor = getBarColor(pct);
  const isNearLimit = !usage.unlimited && pct >= 70;

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={15} className="text-amber-500" strokeWidth={2.5} />
          <span className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-100">
            AI tokens
          </span>
        </div>
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded-full"
          style={{
            background: usage.unlimited ? "#fef3c7" : "#f0fdf4",
            color: usage.unlimited ? "#d97706" : "#16a34a",
          }}
        >
          {usage.plan_name}
        </span>
      </div>

      {usage.unlimited ? (
        <div className="flex items-center gap-2 text-[13px] text-neutral-500 dark:text-neutral-400">
          <TrendingUp size={14} className="text-green-500" />
          <span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-100">
              {formatTokens(usage.used)}
            </span>{" "}
            tokens used — unlimited plan
          </span>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: barColor }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[12px] text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                {formatTokens(usage.used)}
              </span>{" "}
              /{" "}
              <span>{formatTokens(usage.limit)}</span>
              {" "}used
            </span>
            <span className="text-[12px] font-medium" style={{ color: barColor }}>
              {pct.toFixed(0)}%
            </span>
          </div>

          {isNearLimit && (
            <button
              onClick={() => router.push("/entrepreneur/upgrade-plan")}
              className="mt-3 w-full text-[12px] font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline underline-offset-2 text-left transition-colors"
            >
              {pct >= 90 ? "Limit almost reached — upgrade now" : "Running low — upgrade plan"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

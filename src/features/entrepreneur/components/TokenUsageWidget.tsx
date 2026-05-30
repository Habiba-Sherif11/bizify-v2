"use client";

import { useEffect, useState } from "react";
import { Zap, ShoppingCart, Infinity } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/features/auth/lib/api";

interface UsageData {
  used:          number;
  limit:         number;
  remaining:     number;
  percentage:    number;
  unlimited:     boolean;
  plan_name:     string;
  is_ppf:        boolean;
  ppf_purchased: number;
  ppf_used:      number;
  ppf_remaining: number;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
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
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-card dark:bg-neutral-800 p-4 animate-pulse">
        <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded mb-3" />
        <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-700 rounded-full mb-2" />
        <div className="h-3 w-32 bg-neutral-100 dark:bg-neutral-700 rounded" />
      </div>
    );
  }

  if (!usage) return null;

  // PPF plan — show credit balance
  if (usage.is_ppf) {
    const { ppf_remaining, ppf_purchased, ppf_used } = usage;
    const low = ppf_remaining <= 1;
    const pctUsed = ppf_purchased > 0 ? Math.min((ppf_used / ppf_purchased) * 100, 100) : 0;

    return (
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-card dark:bg-neutral-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart size={15} className="text-amber-500" strokeWidth={2.5} />
            <span className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-100">
              Section credits
            </span>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            Pay-Per-Feature
          </span>
        </div>

        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[13px] text-neutral-700 dark:text-neutral-300">
            <span className="font-semibold">{ppf_remaining}</span>
            <span className="text-neutral-400 dark:text-neutral-500"> of {ppf_purchased} credits left</span>
          </span>
          <span className="text-[12px] text-neutral-400 dark:text-neutral-500 tabular-nums">
            {ppf_used} used
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${low ? "bg-amber-500" : "bg-neutral-400 dark:bg-neutral-500"}`}
            style={{ width: `${pctUsed}%` }}
          />
        </div>

        {low && (
          <button
            type="button"
            onClick={() => router.push("/entrepreneur/upgrade-plan")}
            className="w-full text-[12px] font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 underline underline-offset-2 text-left transition-colors"
          >
            {ppf_remaining === 0 ? "No credits left — buy more sections" : "Running low — buy more sections"}
          </button>
        )}
      </div>
    );
  }

  // Subscription plan (Free / Pro / Premium)
  const pct = usage.unlimited ? 0 : Math.min(usage.percentage, 100);
  const isNearLimit = !usage.unlimited && pct >= 70;

  const barColor =
    pct >= 90 ? "bg-[#E53935]" :
    pct >= 70 ? "bg-amber-500" :
    "bg-neutral-300 dark:bg-neutral-500";

  const pctTextColor =
    pct >= 90 ? "text-[#E53935]" :
    pct >= 70 ? "text-amber-600 dark:text-amber-500" :
    "text-neutral-400 dark:text-neutral-500";

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-card dark:bg-neutral-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {usage.unlimited ? (
            <Infinity size={15} className="text-neutral-400 dark:text-neutral-500" strokeWidth={2.5} />
          ) : (
            <Zap size={15} className="text-amber-500" strokeWidth={2.5} />
          )}
          <span className="text-[13px] font-semibold text-neutral-800 dark:text-neutral-100">
            AI tokens
          </span>
        </div>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
            usage.unlimited
              ? "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
              : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
          }`}
        >
          {usage.plan_name}
        </span>
      </div>

      {usage.unlimited ? (
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
          <span className="font-semibold text-neutral-800 dark:text-neutral-100">
            {formatTokens(usage.used)}
          </span>{" "}
          tokens used this month
        </p>
      ) : (
        <>
          <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[12px] text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                {formatTokens(usage.used)}
              </span>
              {" "}/ {formatTokens(usage.limit)} used
            </span>
            <span className={`text-[12px] font-medium ${pctTextColor}`}>
              {pct.toFixed(0)}%
            </span>
          </div>

          {isNearLimit && (
            <button
              type="button"
              onClick={() => router.push("/entrepreneur/upgrade-plan")}
              className="mt-3 w-full text-[12px] font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 underline underline-offset-2 text-left transition-colors"
            >
              {pct >= 90 ? "Limit almost reached — upgrade now" : "Running low — upgrade plan"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

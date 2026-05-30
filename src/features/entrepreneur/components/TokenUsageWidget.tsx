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

interface TokenWidgetProps {
  variant?: "card" | "header";
}

export function TokenUsageWidget({ variant = "card" }: TokenWidgetProps) {
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
    if (variant === "header") {
      return (
        <div className="h-11 w-48 rounded-lg bg-neutral-100 dark:bg-neutral-700 animate-pulse" />
      );
    }
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

    if (variant === "header") {
      return (
        <button
          type="button"
          onClick={() => router.push("/entrepreneur/upgrade-plan")}
          className="group relative flex items-center gap-2.5 h-11 px-3 rounded-lg bg-neutral-100/60 dark:bg-neutral-700/40 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 border border-neutral-200 dark:border-neutral-700 transition-all duration-200 hover:ring-1 hover:ring-amber-500/20"
        >
          <ShoppingCart size={14} className="text-amber-500 shrink-0" strokeWidth={2.5} aria-hidden="true" />
          <div className="text-left min-w-0">
            <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 leading-none">
              {ppf_remaining} credits
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-none">
              {low ? "Low" : "Available"}
            </p>
          </div>
        </button>
      );
    }

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

  // Header variant: compact inline display
  if (variant === "header") {
    if (usage.unlimited) {
      return (
        <div className="flex items-center gap-2 h-11 px-3 rounded-lg bg-neutral-100/60 dark:bg-neutral-700/40 border border-neutral-200 dark:border-neutral-700">
          <Infinity size={14} className="text-neutral-400 dark:text-neutral-500 shrink-0" strokeWidth={2.5} aria-hidden="true" />
          <div className="text-left">
            <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 leading-none">
              Unlimited
            </p>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-none">
              {formatTokens(usage.used)} used
            </p>
          </div>
        </div>
      );
    }

    const statusText = pct >= 90 ? "Critical" : pct >= 70 ? "Running low" : "Good";
    const statusColor = pct >= 90 ? "text-[#E53935]" : pct >= 70 ? "text-amber-600 dark:text-amber-500" : "text-neutral-600 dark:text-neutral-400";

    return (
      <button
        type="button"
        onClick={() => router.push("/entrepreneur/upgrade-plan")}
        className={`group relative flex items-center gap-2.5 h-11 px-3 rounded-lg border transition-all duration-200 ${
          isNearLimit
            ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 hover:bg-amber-50/60 dark:hover:bg-amber-950/30 hover:ring-1 hover:ring-amber-500/30"
            : "bg-neutral-100/60 dark:bg-neutral-700/40 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60"
        }`}
      >
        <Zap size={14} className={isNearLimit ? "text-amber-500" : "text-neutral-400 dark:text-neutral-500"} strokeWidth={2.5} aria-hidden="true" />
        <div className="text-left min-w-0 flex-1">
          <p className={`text-[11px] font-semibold leading-none ${isNearLimit ? "text-amber-700 dark:text-amber-400" : "text-neutral-700 dark:text-neutral-300"}`}>
            {formatTokens(usage.remaining)} left
          </p>
          <p className={`text-[10px] leading-none ${statusColor}`}>
            {statusText}
          </p>
        </div>
        <span className={`text-[10px] font-medium tabular-nums shrink-0 ${pctTextColor}`}>
          {pct.toFixed(0)}%
        </span>
      </button>
    );
  }

  // Card variant: original full-width design
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

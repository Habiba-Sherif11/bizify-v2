"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

// ─── types ───────────────────────────────────────────────────────────────────

interface UsageData {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  unlimited: boolean;
  plan_name: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function ringColor(pct: number): string {
  if (pct >= 90) return "#ef4444"; // red-500
  if (pct >= 70) return "#f97316"; // orange-500
  return "#3b82f6";                // blue-500
}

// ─── circle ring ─────────────────────────────────────────────────────────────

function Ring({ percentage, size = 36 }: { percentage: number; size?: number }) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ * Math.min(percentage / 100, 1);
  const color = ringColor(percentage);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {/* track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        className="text-neutral-200 dark:text-neutral-700"
      />
      {/* filled arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.4s ease" }}
      />
    </svg>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function TokenUsageCircle() {
  const router = useRouter();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/usage");
        if (!res.ok) return;
        const data: UsageData = await res.json();
        if (!cancelled) setUsage(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading || !usage) {
    // skeleton ring while loading
    return (
      <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
    );
  }

  const pct = usage.unlimited ? 0 : Math.round(usage.percentage);
  const color = ringColor(pct);
  const isNearLimit = !usage.unlimited && pct >= 80;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            usage.unlimited
              ? "AI tokens: unlimited"
              : `AI tokens: ${pct}% used`
          }
          className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Ring percentage={pct} size={36} />
          {/* centre label */}
          <span
            className="absolute text-[9px] font-semibold leading-none tabular-nums"
            style={{ color: usage.unlimited ? "#3b82f6" : color }}
          >
            {usage.unlimited ? "∞" : `${pct}%`}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 p-0 overflow-hidden rounded-xl shadow-lg">
        {/* header */}
        <div className="px-4 pt-4 pb-3 bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-100 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">AI Token Usage</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
              {usage.plan_name}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">Current billing cycle</p>
        </div>

        {/* body */}
        <div className="px-4 py-4 space-y-4">
          {/* large ring + numbers */}
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center shrink-0">
              <Ring percentage={pct} size={72} />
              <span
                className="absolute text-sm font-bold"
                style={{ color: usage.unlimited ? "#3b82f6" : color }}
              >
                {usage.unlimited ? "∞" : `${pct}%`}
              </span>
            </div>

            <div className="space-y-1.5 min-w-0">
              <Stat
                label="Used"
                value={formatTokens(usage.used)}
                valueClass="text-neutral-800 dark:text-neutral-200"
              />
              {!usage.unlimited && (
                <>
                  <Stat
                    label="Remaining"
                    value={formatTokens(usage.remaining)}
                    valueClass={isNearLimit ? "text-red-500" : "text-green-600 dark:text-green-400"}
                  />
                  <Stat
                    label="Limit"
                    value={formatTokens(usage.limit)}
                    valueClass="text-neutral-500 dark:text-neutral-400"
                  />
                </>
              )}
              {usage.unlimited && (
                <Stat label="Limit" value="Unlimited" valueClass="text-blue-500" />
              )}
            </div>
          </div>

          {/* progress bar */}
          {!usage.unlimited && (
            <div>
              <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
                />
              </div>
              {isNearLimit && (
                <p className="mt-1.5 text-xs text-orange-500 dark:text-orange-400">
                  {pct >= 100 ? "Token limit reached." : "Approaching token limit."}
                </p>
              )}
            </div>
          )}
        </div>

        {/* upgrade CTA */}
        {!usage.unlimited && (
          <div className="px-4 pb-4">
            <Button
              type="button"
              size="sm"
              className="w-full gap-1.5 bg-amber-500 hover:bg-amber-600 text-white border-0 text-xs"
              onClick={() => router.push("/entrepreneur/upgrade-plan")}
            >
              <Zap size={13} aria-hidden="true" />
              Upgrade for more tokens
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── stat row ─────────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-neutral-500 dark:text-neutral-400 shrink-0">{label}</span>
      <span className={`text-xs font-semibold tabular-nums ${valueClass ?? ""}`}>{value}</span>
    </div>
  );
}

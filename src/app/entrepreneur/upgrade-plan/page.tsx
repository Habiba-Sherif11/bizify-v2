"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Minus,
  Zap,
  CreditCard,
  X,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Star,
  Coins,
  Infinity as InfinityIcon,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/features/entrepreneur/components/DashboardHeader";
import { api } from "@/features/auth/lib/api";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tier = "freemium" | "pay-per-feature" | "premium";

interface UIPlan {
  tier: Tier;
  label: string;
  subtitle: string;
  /** Display string for the price, e.g. "0", "120 – 150", "350" */
  priceDisplay: string;
  /** Unit label shown beside the price, e.g. "EGP / feature" */
  priceUnit: string;
  /** Fallback token count when backend features_json.ai_tokens is absent */
  defaultTokens: number;
  dotBg: string;
  badgeBg: string;
  badgeText: string;
  checkBg: string;
  checkText: string;
  popular?: boolean;
  isFree?: boolean;
  nameHints: string[];
  priceHint: number;
}

interface BackendPlan {
  id: string;
  name: string;
  price: number;
  features_json: {
    ai_tokens?: number;
    ideas?: number;
    businesses?: number;
    export?: boolean;
    priority_support?: boolean;
  } | null;
  is_active: boolean;
}

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  plan?: BackendPlan;
}

interface UsageData {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  unlimited: boolean;
  plan_name: string;
}

// ─── Static plan tiers ────────────────────────────────────────────────────────

const UI_PLANS: UIPlan[] = [
  {
    tier: "freemium",
    label: "Free",
    subtitle: "Freemium",
    priceDisplay: "0",
    priceUnit: "EGP",
    defaultTokens: 20_000,
    dotBg: "bg-[#8ECAE6]",
    badgeBg: "bg-[#8ECAE6]/10",
    badgeText: "text-[#8ECAE6]",
    checkBg: "bg-[#8ECAE6]/15",
    checkText: "text-[#8ECAE6]",
    isFree: true,
    nameHints: ["free"],
    priceHint: 0,
  },
  {
    tier: "pay-per-feature",
    label: "Pay-Per-Feature",
    subtitle: "Pay only for what you use",
    priceDisplay: "120 – 150",
    priceUnit: "EGP / feature",
    defaultTokens: 500_000,
    dotBg: "bg-[#FB8500]",
    badgeBg: "bg-[#FB8500]/10",
    badgeText: "text-[#FB8500]",
    checkBg: "bg-[#FB8500]/15",
    checkText: "text-[#FB8500]",
    popular: true,
    nameHints: ["pro", "pay", "starter", "basic"],
    priceHint: 9.99,
  },
  {
    tier: "premium",
    label: "Premium",
    subtitle: "Everything, unlimited",
    priceDisplay: "350",
    priceUnit: "EGP / month",
    defaultTokens: -1,
    dotBg: "bg-[#126782]",
    badgeBg: "bg-[#126782]/10",
    badgeText: "text-[#126782]",
    checkBg: "bg-[#126782]/15",
    checkText: "text-[#126782]",
    nameHints: ["enterprise", "premium", "business", "growth"],
    priceHint: 29.99,
  },
];

const FEATURES: { name: string; freemium: boolean; pay: boolean; premium: boolean }[] = [
  { name: "AI idea brainstorming",    freemium: true,  pay: true,  premium: true  },
  { name: "Market research overview", freemium: true,  pay: true,  premium: true  },
  { name: "5 ideas / month",          freemium: true,  pay: false, premium: false },
  { name: "50 ideas / month",         freemium: false, pay: true,  premium: false },
  { name: "Unlimited ideas",          freemium: false, pay: false, premium: true  },
  { name: "Competitor analysis",      freemium: false, pay: true,  premium: true  },
  { name: "Business plan builder",    freemium: false, pay: true,  premium: true  },
  { name: "AI mentor chat",           freemium: false, pay: true,  premium: true  },
  { name: "Export reports",           freemium: false, pay: true,  premium: true  },
  { name: "Financial projections",    freemium: false, pay: false, premium: true  },
  { name: "Pitch deck generator",     freemium: false, pay: false, premium: true  },
  { name: "Priority support",         freemium: false, pay: false, premium: true  },
  { name: "Advanced AI models",       freemium: false, pay: false, premium: true  },
  { name: "Unlimited businesses",     freemium: false, pay: false, premium: true  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTokens(n: number): string {
  if (n === -1) return "Unlimited";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function matchBackendPlan(uiPlan: UIPlan, backendPlans: BackendPlan[]): BackendPlan | null {
  if (!backendPlans.length) return null;
  for (const hint of uiPlan.nameHints) {
    const match = backendPlans.find((p) =>
      p.name.toLowerCase().includes(hint.toLowerCase())
    );
    if (match) return match;
  }
  return backendPlans.reduce((best, p) =>
    Math.abs(p.price - uiPlan.priceHint) < Math.abs(best.price - uiPlan.priceHint) ? p : best
  );
}

function usageColorClass(pct: number): string {
  if (pct >= 90) return "text-red-500";
  if (pct >= 70) return "text-orange-500";
  return "text-blue-500";
}

function usageBgClass(pct: number): string {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 70) return "bg-orange-500";
  return "bg-blue-500";
}

// ─── Usage Bar ────────────────────────────────────────────────────────────────

function UsageSummary({ usage }: { usage: UsageData }) {
  const pct = usage.unlimited ? 0 : Math.min(Math.round(usage.percentage), 100);
  const isWarn = !usage.unlimited && pct >= 70;

  return (
    <div className="max-w-xl mx-auto mb-8 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Coins size={15} className="text-neutral-400" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
            AI Token Usage
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium">
            {usage.plan_name}
          </span>
        </div>
        <span className={cn(
          "text-sm font-semibold tabular-nums",
          usage.unlimited ? "text-blue-500" : usageColorClass(pct)
        )}>
          {usage.unlimited
            ? "∞ Unlimited"
            : `${formatTokens(usage.used)} / ${formatTokens(usage.limit)}`}
        </span>
      </div>
      {!usage.unlimited && (
        <>
          <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", usageBgClass(pct))}
              style={{ width: `${pct}%` }}
            />
          </div>
          {isWarn && (
            <p className="mt-1.5 text-xs text-orange-500 dark:text-orange-400">
              {pct >= 100
                ? "Token limit reached — upgrade to continue using AI features."
                : `${pct}% used — consider upgrading for more tokens.`}
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────

function PaymentModal({
  uiPlan,
  onClose,
  onPayPal,
  onCard,
  processing,
  iframeUrl,
}: {
  uiPlan: UIPlan;
  onClose: () => void;
  onPayPal: () => void;
  onCard: () => void;
  processing: boolean;
  iframeUrl: string | null;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-0.5">
              Subscribe to
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", uiPlan.dotBg)} />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{uiPlan.label}</h2>
              <span className="text-base font-bold text-neutral-900 dark:text-white">
                {uiPlan.priceDisplay}
                <span className="text-sm font-normal text-neutral-400 ml-1">{uiPlan.priceUnit}</span>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            aria-label="Close"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {iframeUrl ? (
          <div className="p-4">
            <p className="text-sm text-neutral-500 mb-3 text-center">Enter your card details below</p>
            <iframe
              src={iframeUrl}
              className="w-full h-[420px] rounded-xl border border-neutral-200 dark:border-neutral-700"
              title="Card payment"
            />
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Choose your payment method
            </p>

            <button
              type="button"
              onClick={onPayPal}
              disabled={processing}
              className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#003087] flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">PayPal</p>
                  <p className="text-xs text-neutral-400">Pay securely with your PayPal account</p>
                </div>
              </div>
              {processing
                ? <Loader2 size={16} className="text-amber-500 animate-spin shrink-0" />
                : <Zap size={16} className="text-neutral-300 group-hover:text-amber-400 transition-colors shrink-0" />}
            </button>

            <button
              type="button"
              onClick={onCard}
              disabled={processing}
              className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center shrink-0">
                  <CreditCard size={18} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">Credit / Debit Card</p>
                  <p className="text-xs text-neutral-400">Visa, Mastercard — powered by Paymob</p>
                </div>
              </div>
              {processing
                ? <Loader2 size={16} className="text-cyan-500 animate-spin shrink-0" />
                : <CreditCard size={16} className="text-neutral-300 group-hover:text-cyan-400 transition-colors shrink-0" />}
            </button>

            <p className="text-xs text-center text-neutral-400 pt-1">Payments are secure and encrypted</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
  uiPlan,
  backendPlan,
  isCurrent,
  onSelect,
}: {
  uiPlan: UIPlan;
  backendPlan: BackendPlan | null;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  const featureKey = uiPlan.tier === "freemium" ? "freemium"
    : uiPlan.tier === "pay-per-feature" ? "pay"
    : "premium";

  // Use backend token count if available, otherwise fall back to the UI default
  const tokenCount = backendPlan?.features_json?.ai_tokens ?? uiPlan.defaultTokens;
  const isUnlimited = tokenCount === -1;
  const tokenLabel = isUnlimited ? "Unlimited tokens" : `${formatTokens(tokenCount)} tokens`;
  const canUpgrade = !uiPlan.isFree && !isCurrent && !!backendPlan;

  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 flex flex-col",
        uiPlan.popular
          ? "ring-2 ring-amber-400 dark:ring-amber-500 bg-white dark:bg-neutral-800 shadow-xl"
          : "border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80",
        isCurrent && "ring-2 ring-green-400 dark:ring-green-500"
      )}
    >
      {/* Badges */}
      {uiPlan.popular && !isCurrent && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500 text-white text-[0.65rem] font-bold uppercase tracking-wide">
          <Star size={9} fill="currentColor" /> Most Popular
        </span>
      )}
      {isCurrent && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-0.5 rounded-full bg-green-500 text-white text-[0.65rem] font-bold uppercase tracking-wide">
          <CheckCircle2 size={9} /> Current Plan
        </span>
      )}

      {/* Name */}
      <div className="flex items-center gap-2 mb-0.5">
        <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", uiPlan.dotBg)} />
        <h3 className="font-bold text-base text-neutral-900 dark:text-white">{uiPlan.label}</h3>
      </div>
      <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-3 ml-[18px]">{uiPlan.subtitle}</p>

      {/* Token badge */}
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mb-4 w-fit text-xs font-semibold",
        uiPlan.badgeBg,
        uiPlan.badgeText
      )}>
        {isUnlimited
          ? <InfinityIcon size={12} strokeWidth={2.5} />
          : <Coins size={12} strokeWidth={2.5} />}
        {tokenLabel}
      </div>

      {/* Price */}
      <div className="mb-5">
        {uiPlan.isFree ? (
          <span className="text-4xl font-bold text-neutral-900 dark:text-white">Free</span>
        ) : (
          <>
            <span className="text-3xl font-bold text-neutral-900 dark:text-white">
              {uiPlan.priceDisplay}
            </span>
            <span className="ml-1.5 text-sm text-neutral-400">{uiPlan.priceUnit}</span>
          </>
        )}
      </div>

      {/* CTA */}
      <Button
        onClick={canUpgrade ? onSelect : undefined}
        disabled={uiPlan.isFree || (isCurrent ? false : !backendPlan)}
        className={cn(
          "w-full mb-6 font-semibold",
          uiPlan.popular && !isCurrent
            ? "bg-amber-500 hover:bg-amber-600 text-white border-0"
            : isCurrent
            ? "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 cursor-default"
            : uiPlan.isFree
            ? "bg-neutral-100 dark:bg-neutral-700/60 text-neutral-400 border-0 cursor-default"
            : "border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:border-neutral-900 dark:hover:border-neutral-300 bg-transparent"
        )}
      >
        {isCurrent ? "Current Plan" : uiPlan.isFree ? "Free forever" : `Upgrade to ${uiPlan.label}`}
      </Button>

      {/* Features */}
      <div className="space-y-2.5 border-t border-neutral-100 dark:border-neutral-700 pt-5 flex-1">
        {FEATURES.map((feature) => {
          const included = feature[featureKey as keyof typeof feature] as boolean;
          return (
            <div key={feature.name} className="flex items-start gap-2.5">
              {included ? (
                <div className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  uiPlan.checkBg
                )}>
                  <Check size={10} strokeWidth={3} className={uiPlan.checkText} />
                </div>
              ) : (
                <div className="w-4 h-4 flex items-center justify-center shrink-0 mt-0.5">
                  <Minus size={12} strokeWidth={1.5} className="text-neutral-300 dark:text-neutral-600" />
                </div>
              )}
              <span className={cn(
                "text-sm leading-snug",
                included
                  ? "text-neutral-700 dark:text-neutral-200"
                  : "text-neutral-400 dark:text-neutral-500"
              )}>
                {feature.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UpgradePlanPage() {
  const [backendPlans, setBackendPlans] = useState<BackendPlan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedUiPlan, setSelectedUiPlan] = useState<UIPlan | null>(null);
  const [processing, setProcessing] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, subRes, usageRes] = await Promise.allSettled([
        api.get("/billing/plans"),
        api.get("/billing/subscription"),
        api.get("/usage"),
      ]);
      if (plansRes.status === "fulfilled") setBackendPlans(plansRes.value.data ?? []);
      if (subRes.status === "fulfilled") setSubscription(subRes.value.data);
      if (usageRes.status === "fulfilled") setUsage(usageRes.value.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getBackendPlan = useCallback(
    (uiPlan: UIPlan) => matchBackendPlan(uiPlan, backendPlans),
    [backendPlans]
  );

  const currentUiTier: Tier | null = (() => {
    if (!subscription?.plan_id || !backendPlans.length) return null;
    const activePlan = backendPlans.find((p) => p.id === subscription.plan_id);
    if (!activePlan) return null;
    for (const ui of UI_PLANS) {
      if (getBackendPlan(ui)?.id === activePlan.id) return ui.tier;
    }
    return null;
  })();

  const handlePayPal = async () => {
    if (!selectedUiPlan) return;
    const backend = getBackendPlan(selectedUiPlan);
    if (!backend) return;
    setProcessing(true);
    try {
      const { data } = await api.post("/billing/paypal/subscribe", { plan_id: backend.id });
      sessionStorage.setItem("paypal_plan_id", backend.id);
      sessionStorage.setItem("paypal_plan_name", selectedUiPlan.label);
      window.location.href = data.approval_url;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to initiate PayPal payment. Please try again.";
      toast.error(msg);
      setProcessing(false);
    }
  };

  const handleCard = async () => {
    if (!selectedUiPlan) return;
    const backend = getBackendPlan(selectedUiPlan);
    if (!backend) return;
    setProcessing(true);
    try {
      const { data } = await api.post("/billing/paymob/subscribe", { plan_id: backend.id });
      setIframeUrl(data.iframe_url);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to initiate card payment. Please try again.";
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={36} className="animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <DashboardHeader />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8">
            <Link
              href="/entrepreneur"
              className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <ArrowLeft size={15} />
              Dashboard
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <span className="text-sm text-neutral-900 dark:text-white font-medium">Upgrade Plan</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-full">
              <Zap size={13} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                Subscription Plans
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-3">
              Choose the right plan for you
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
              Start free, pay only for features you use, or go unlimited with Premium.
            </p>

            {currentUiTier && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-full">
                <CheckCircle2 size={13} className="text-green-500" />
                <span className="text-sm text-green-700 dark:text-green-400">
                  You&apos;re on the <strong>{UI_PLANS.find((p) => p.tier === currentUiTier)?.label}</strong> plan
                </span>
              </div>
            )}
          </div>

          {/* Token usage summary */}
          {usage && <UsageSummary usage={usage} />}

          {/* 3 plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {UI_PLANS.map((uiPlan) => {
              const backend = getBackendPlan(uiPlan);
              return (
                <PlanCard
                  key={uiPlan.tier}
                  uiPlan={uiPlan}
                  backendPlan={backend}
                  isCurrent={currentUiTier === uiPlan.tier}
                  onSelect={() => {
                    setSelectedUiPlan(uiPlan);
                    setIframeUrl(null);
                  }}
                />
              );
            })}
          </div>

          {/* Cancel subscription */}
          {subscription && (
            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={async () => {
                  if (!confirm("Are you sure you want to cancel your subscription?")) return;
                  try {
                    await api.delete("/billing/subscription");
                    toast.success("Subscription cancelled successfully.");
                    setSubscription(null);
                  } catch {
                    toast.error("Failed to cancel subscription. Please try again.");
                  }
                }}
                className="text-sm text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 transition-colors underline underline-offset-4"
              >
                Cancel current subscription
              </button>
            </div>
          )}
        </main>
      </div>

      {selectedUiPlan && (
        <PaymentModal
          uiPlan={selectedUiPlan}
          onClose={() => { if (!processing) { setSelectedUiPlan(null); setIframeUrl(null); } }}
          onPayPal={handlePayPal}
          onCard={handleCard}
          processing={processing}
          iframeUrl={iframeUrl}
        />
      )}
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Zap,
  CreditCard,
  X,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Star,
  Coins,
  Infinity as InfinityIcon,
  ShoppingCart,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/features/entrepreneur/components/DashboardHeader";
import { api } from "@/features/auth/lib/api";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tier = "free" | "ppf" | "pro" | "premium";

interface UIPlan {
  tier:          Tier;
  label:         string;
  subtitle:      string;
  priceDisplay:  string;
  priceUnit:     string;
  tokens:        string;
  tokenNote:     string;
  dotColor:      string;
  accentBg:      string;
  accentText:    string;
  popular?:      boolean;
  isFree?:       boolean;
  isPPF?:        boolean;
  nameHints:     string[];
  priceHint:     number;
}

interface BackendPlan {
  id:            string;
  name:          string;
  price:         number;
  features_json: Record<string, unknown> | null;
  is_active:     boolean;
}

interface Subscription {
  id:      string;
  plan_id: string;
  status:  string;
  plan?:   BackendPlan;
}

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

// ─── All features — same for every plan ───────────────────────────────────────

const ALL_FEATURES = [
  "AI idea brainstorming",
  "Market research reports",
  "Competitor analysis",
  "Business plan builder",
  "AI mentor chat",
  "Financial projections",
  "Pitch deck generator",
  "Export reports (PDF)",
  "Priority support",
  "Custom branding on reports",
  "Advanced AI models",
  "Team collaboration",
  "Dedicated AI advisor",
  "White-label reports",
];

// ─── Static plan definitions ──────────────────────────────────────────────────

const UI_PLANS: UIPlan[] = [
  {
    tier:         "free",
    label:        "Free",
    subtitle:     "Try everything, no card needed",
    priceDisplay: "0",
    priceUnit:    "",
    tokens:       "15K",
    tokenNote:    "≈ 1 full analysis",
    dotColor:     "#8ECAE6",
    accentBg:     "bg-[#8ECAE6]/10",
    accentText:   "text-[#8ECAE6]",
    isFree:       true,
    nameHints:    ["free"],
    priceHint:    0,
  },
  {
    tier:         "ppf",
    label:        "Pay-Per-Feature",
    subtitle:     "Pay only for what you use",
    priceDisplay: "135",
    priceUnit:    "EGP / section",
    tokens:       "3K",
    tokenNote:    "per section purchased",
    dotColor:     "#FB8500",
    accentBg:     "bg-[#FB8500]/10",
    accentText:   "text-[#FB8500]",
    popular:      true,
    isPPF:        true,
    nameHints:    ["pay-per-feature", "pay", "ppf"],
    priceHint:    135,
  },
  {
    tier:         "pro",
    label:        "Pro",
    subtitle:     "For active founders",
    priceDisplay: "350",
    priceUnit:    "EGP / month",
    tokens:       "150K",
    tokenNote:    "≈ 10 full analyses / mo",
    dotColor:     "#219EBC",
    accentBg:     "bg-[#219EBC]/10",
    accentText:   "text-[#219EBC]",
    nameHints:    ["pro"],
    priceHint:    350,
  },
  {
    tier:         "premium",
    label:        "Premium",
    subtitle:     "Everything, unlimited",
    priceDisplay: "600",
    priceUnit:    "EGP / month",
    tokens:       "∞",
    tokenNote:    "Unlimited analyses",
    dotColor:     "#126782",
    accentBg:     "bg-[#126782]/10",
    accentText:   "text-[#126782]",
    nameHints:    ["premium", "enterprise"],
    priceHint:    600,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTokens(n: number): string {
  if (n === -1) return "∞";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function matchBackendPlan(uiPlan: UIPlan, plans: BackendPlan[]): BackendPlan | null {
  if (!plans.length) return null;
  for (const hint of uiPlan.nameHints) {
    const match = plans.find((p) => p.name.toLowerCase().includes(hint.toLowerCase()));
    if (match) return match;
  }
  return plans.reduce((best, p) =>
    Math.abs(p.price - uiPlan.priceHint) < Math.abs(best.price - uiPlan.priceHint) ? p : best
  );
}

// ─── Usage summary bar ────────────────────────────────────────────────────────

function UsageSummary({ usage }: { usage: UsageData }) {
  const pct = usage.unlimited ? 0 : Math.min(Math.round(usage.percentage), 100);

  if (usage.is_ppf) {
    return (
      <div className="max-w-xl mx-auto mb-8 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={15} className="text-amber-500" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">PPF Credits</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">
              Pay-Per-Feature
            </span>
          </div>
          <span className="text-sm font-semibold text-amber-600">
            {usage.ppf_remaining} remaining / {usage.ppf_purchased} purchased
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mb-8 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <Coins size={15} className="text-neutral-400" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">AI Token Usage</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
            {usage.plan_name}
          </span>
        </div>
        <span className={cn("text-sm font-semibold tabular-nums",
          usage.unlimited ? "text-green-600" : pct >= 90 ? "text-red-500" : pct >= 70 ? "text-orange-500" : "text-blue-500"
        )}>
          {usage.unlimited ? "∞ Unlimited" : `${formatTokens(usage.used)} / ${formatTokens(usage.limit)}`}
        </span>
      </div>
      {!usage.unlimited && (
        <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500",
              pct >= 90 ? "bg-red-500 w-full" : pct >= 70 ? "bg-orange-500" : "bg-blue-500"
            )}
            style={{ width: pct < 90 ? `${pct}%` : undefined }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Payment modal (subscription plans) ──────────────────────────────────────

function PaymentModal({
  uiPlan, onClose, onPayPal, onCard, processing, iframeUrl,
}: {
  uiPlan:     UIPlan;
  onClose:    () => void;
  onPayPal:   () => void;
  onCard:     () => void;
  processing: boolean;
  iframeUrl:  string | null;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-0.5">Subscribe to</p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", uiPlan.accentBg)} />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{uiPlan.label}</h2>
              <span className="text-base font-bold text-neutral-900 dark:text-white">
                {uiPlan.priceDisplay}
                <span className="text-sm font-normal text-neutral-400 ml-1">{uiPlan.priceUnit}</span>
              </span>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={processing} aria-label="Close"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {iframeUrl ? (
          <div className="p-4">
            <p className="text-sm text-neutral-500 mb-3 text-center">Enter your card details below</p>
            <iframe src={iframeUrl} className="w-full h-[420px] rounded-xl border border-neutral-200" title="Card payment" />
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">Choose your payment method</p>

            <button type="button" onClick={onPayPal} disabled={processing}
              className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border-2 border-neutral-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all group disabled:opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#003087] flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">PayPal</p>
                  <p className="text-xs text-neutral-400">Pay securely with your PayPal account</p>
                </div>
              </div>
              {processing ? <Loader2 size={16} className="text-amber-500 animate-spin" /> : <Zap size={16} className="text-neutral-300 group-hover:text-amber-400 transition-colors" />}
            </button>

            <button type="button" onClick={onCard} disabled={processing}
              className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border-2 border-neutral-200 hover:border-cyan-400 hover:bg-cyan-50/50 transition-all group disabled:opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center shrink-0">
                  <CreditCard size={18} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">Credit / Debit Card</p>
                  <p className="text-xs text-neutral-400">Visa, Mastercard — powered by Paymob</p>
                </div>
              </div>
              {processing ? <Loader2 size={16} className="text-cyan-500 animate-spin" /> : <CreditCard size={16} className="text-neutral-300 group-hover:text-cyan-400 transition-colors" />}
            </button>

            <p className="text-xs text-center text-neutral-400 pt-1">Payments are secure and encrypted</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PPF buy modal (quantity selector) ───────────────────────────────────────

function PPFModal({
  onClose, onPayPal, onCard, processing, iframeUrl, quantity, setQuantity,
}: {
  onClose:     () => void;
  onPayPal:    () => void;
  onCard:      () => void;
  processing:  boolean;
  iframeUrl:   string | null;
  quantity:    number;
  setQuantity: (n: number) => void;
}) {
  const pricePerSection = 135;
  const discount = quantity >= 3 ? 0.15 : 0;
  const total = Math.round(pricePerSection * quantity * (1 - discount));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-0.5">Buy section credits</p>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Pay-Per-Feature</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={processing} aria-label="Close"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {iframeUrl ? (
          <div className="p-4">
            <p className="text-sm text-neutral-500 mb-3 text-center">Enter your card details below</p>
            <iframe src={iframeUrl} className="w-full h-[420px] rounded-xl border border-neutral-200" title="Card payment" />
          </div>
        ) : (
          <div className="p-5">
            {/* Quantity selector */}
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 mb-5">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-3">How many sections?</p>
              <div className="flex items-center justify-between gap-4">
                <button type="button" aria-label="Decrease quantity"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors disabled:opacity-40"
                  disabled={quantity <= 1}>
                  <Minus size={16} className="text-neutral-600" aria-hidden="true" />
                </button>
                <div className="text-center flex-1">
                  <span className="text-3xl font-bold text-neutral-900 dark:text-white">{quantity}</span>
                  <p className="text-xs text-neutral-400 mt-0.5">section{quantity !== 1 ? "s" : ""}</p>
                </div>
                <button type="button" aria-label="Increase quantity"
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 transition-colors disabled:opacity-40"
                  disabled={quantity >= 10}>
                  <Plus size={16} className="text-neutral-600" aria-hidden="true" />
                </button>
              </div>

              {/* Price breakdown */}
              <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-700 space-y-1">
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>{quantity} × 135 EGP</span>
                  <span>{pricePerSection * quantity} EGP</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Bundle discount (15%)</span>
                    <span>−{Math.round(pricePerSection * quantity * discount)} EGP</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-neutral-900 dark:text-white pt-1">
                  <span>Total</span>
                  <span>{total} EGP</span>
                </div>
              </div>
              {quantity >= 3 && (
                <p className="mt-2 text-xs text-amber-600 font-medium text-center">
                  🎉 15% bundle discount applied!
                </p>
              )}
              {quantity < 3 && (
                <p className="mt-2 text-xs text-neutral-400 text-center">
                  Buy 3+ sections to get a 15% discount
                </p>
              )}
            </div>

            {/* Payment buttons */}
            <div className="space-y-3">
              <button type="button" onClick={onPayPal} disabled={processing}
                className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border-2 border-neutral-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all group disabled:opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#003087] flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">PayPal</p>
                    <p className="text-xs text-neutral-400">Pay {total} EGP via PayPal</p>
                  </div>
                </div>
                {processing ? <Loader2 size={16} className="text-amber-500 animate-spin" /> : <Zap size={16} className="text-neutral-300 group-hover:text-amber-400 transition-colors" />}
              </button>

              <button type="button" onClick={onCard} disabled={processing}
                className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border-2 border-neutral-200 hover:border-cyan-400 hover:bg-cyan-50/50 transition-all group disabled:opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center shrink-0">
                    <CreditCard size={18} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">Credit / Debit Card</p>
                    <p className="text-xs text-neutral-400">Pay {total} EGP via Paymob</p>
                  </div>
                </div>
                {processing ? <Loader2 size={16} className="text-cyan-500 animate-spin" /> : <CreditCard size={16} className="text-neutral-300 group-hover:text-cyan-400 transition-colors" />}
              </button>

              <p className="text-xs text-center text-neutral-400 pt-1">Payments are secure and encrypted</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({
  uiPlan, isCurrent, onSelect,
}: {
  uiPlan:   UIPlan;
  isCurrent: boolean;
  onSelect:  () => void;
}) {
  const isUnlimited = uiPlan.tokens === "∞";

  return (
    <div className={cn(
      "relative rounded-2xl p-6 flex flex-col bg-white dark:bg-neutral-800",
      uiPlan.popular && !isCurrent
        ? "ring-2 ring-amber-400 shadow-xl shadow-amber-100/40"
        : isCurrent
        ? "ring-2 ring-green-400 dark:ring-green-500"
        : "border border-neutral-200 dark:border-neutral-700"
    )}>
      {/* Top badge */}
      {uiPlan.popular && !isCurrent && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500 text-white text-[0.62rem] font-bold uppercase tracking-wide whitespace-nowrap">
          <Star size={9} fill="currentColor" /> Most Popular
        </span>
      )}
      {isCurrent && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-0.5 rounded-full bg-green-500 text-white text-[0.62rem] font-bold uppercase tracking-wide whitespace-nowrap">
          <CheckCircle2 size={9} /> Current Plan
        </span>
      )}

      {/* Name + subtitle */}
      <div className="flex items-center gap-2 mb-0.5">
        <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", uiPlan.accentBg)} />
        <h3 className="font-bold text-base text-neutral-900 dark:text-white">{uiPlan.label}</h3>
      </div>
      <p className="text-xs text-neutral-400 mb-3 ml-[18px]">{uiPlan.subtitle}</p>

      {/* Token badge */}
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mb-4 w-fit text-xs font-semibold", uiPlan.accentBg, uiPlan.accentText)}>
        {isUnlimited
          ? <InfinityIcon size={12} strokeWidth={2.5} />
          : uiPlan.isPPF
          ? <ShoppingCart size={12} strokeWidth={2.5} />
          : <Coins size={12} strokeWidth={2.5} />}
        {uiPlan.tokens} tokens
        <span className="font-normal text-[0.65rem] opacity-70">{uiPlan.isPPF ? "/ section" : ""}</span>
      </div>

      {/* Price */}
      <div className="mb-2">
        {uiPlan.isFree
          ? <span className="text-4xl font-bold text-neutral-900 dark:text-white">Free</span>
          : <>
              <span className="text-3xl font-bold text-neutral-900 dark:text-white">{uiPlan.priceDisplay}</span>
              <span className="ml-1.5 text-sm text-neutral-400">{uiPlan.priceUnit}</span>
            </>}
      </div>
      <p className="text-[0.7rem] text-neutral-400 mb-5">{uiPlan.tokenNote}</p>

      {/* CTA */}
      <Button
        type="button"
        onClick={!uiPlan.isFree && !isCurrent ? onSelect : undefined}
        disabled={uiPlan.isFree || isCurrent}
        className={cn(
          "w-full mb-6 font-semibold",
          uiPlan.popular && !isCurrent
            ? "bg-amber-500 hover:bg-amber-600 text-white border-0"
            : isCurrent
            ? "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border-green-200 cursor-default"
            : uiPlan.isFree
            ? "bg-neutral-100 text-neutral-400 border-0 cursor-default"
            : "border-2 border-neutral-300 text-neutral-700 hover:border-neutral-900 bg-transparent"
        )}
      >
        {isCurrent
          ? "Current Plan"
          : uiPlan.isFree
          ? "Free forever"
          : uiPlan.isPPF
          ? "Buy sections"
          : `Upgrade to ${uiPlan.label}`}
      </Button>

      {/* Features — all ticked for every plan */}
      <div className="space-y-2.5 border-t border-neutral-100 dark:border-neutral-700 pt-5 flex-1">
        <p className="text-[0.7rem] font-semibold text-neutral-400 uppercase tracking-wider mb-3">
          All features included
        </p>
        {ALL_FEATURES.map((f) => (
          <div key={f} className="flex items-start gap-2.5">
            <div className={cn("w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5", uiPlan.accentBg)}>
              <Check size={10} strokeWidth={3} className={uiPlan.accentText} />
            </div>
            <span className="text-sm text-neutral-700 dark:text-neutral-200 leading-snug">{f}</span>
          </div>
        ))}
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

  // Subscription plan modal state
  const [selectedSubPlan, setSelectedSubPlan] = useState<UIPlan | null>(null);
  const [subProcessing, setSubProcessing] = useState(false);
  const [subIframeUrl, setSubIframeUrl] = useState<string | null>(null);

  // PPF modal state
  const [ppfOpen, setPpfOpen] = useState(false);
  const [ppfQuantity, setPpfQuantity] = useState(1);
  const [ppfProcessing, setPpfProcessing] = useState(false);
  const [ppfIframeUrl, setPpfIframeUrl] = useState<string | null>(null);

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

  const currentTier: Tier | null = (() => {
    if (!subscription?.plan_id || !backendPlans.length) return null;
    const active = backendPlans.find((p) => p.id === subscription.plan_id);
    if (!active) return null;
    for (const ui of UI_PLANS) {
      if (matchBackendPlan(ui, backendPlans)?.id === active.id) return ui.tier;
    }
    return null;
  })();

  // Subscription handlers
  const handleSubPayPal = async () => {
    if (!selectedSubPlan) return;
    const backend = matchBackendPlan(selectedSubPlan, backendPlans);
    if (!backend) return;
    setSubProcessing(true);
    try {
      const { data } = await api.post("/billing/paypal/subscribe", { plan_id: backend.id });
      sessionStorage.setItem("paypal_plan_id", backend.id);
      window.location.href = data.approval_url;
    } catch {
      toast.error("Failed to initiate PayPal payment. Please try again.");
      setSubProcessing(false);
    }
  };

  const handleSubCard = async () => {
    if (!selectedSubPlan) return;
    const backend = matchBackendPlan(selectedSubPlan, backendPlans);
    if (!backend) return;
    setSubProcessing(true);
    try {
      const { data } = await api.post("/billing/paymob/subscribe", { plan_id: backend.id });
      setSubIframeUrl(data.iframe_url);
    } catch {
      toast.error("Failed to initiate card payment. Please try again.");
    } finally {
      setSubProcessing(false);
    }
  };

  // PPF handlers
  const handlePpfPayPal = async () => {
    setPpfProcessing(true);
    try {
      const { data } = await api.post("/billing/ppf/paypal", { quantity: ppfQuantity });
      sessionStorage.setItem("ppf_order_id", data.order_id);
      window.location.href = data.approval_url;
    } catch {
      toast.error("Failed to initiate PayPal payment. Please try again.");
      setPpfProcessing(false);
    }
  };

  const handlePpfCard = async () => {
    setPpfProcessing(true);
    try {
      const { data } = await api.post("/billing/ppf/paymob", { quantity: ppfQuantity });
      setPpfIframeUrl(data.iframe_url);
    } catch {
      toast.error("Failed to initiate card payment. Please try again.");
    } finally {
      setPpfProcessing(false);
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

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8">
            <Link href="/entrepreneur"
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
              <ArrowLeft size={15} /> Dashboard
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-sm text-neutral-900 dark:text-white font-medium">Upgrade Plan</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-amber-50 border border-amber-200 rounded-full">
              <Zap size={13} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Plans</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-3">
              All features. Every plan.
            </h1>
            <p className="text-neutral-500 max-w-xl mx-auto text-sm">
              Every plan unlocks every feature — the only difference is your token budget.
            </p>
            {currentTier && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                <CheckCircle2 size={13} className="text-green-500" />
                <span className="text-sm text-green-700">
                  You&apos;re on the <strong>{UI_PLANS.find((p) => p.tier === currentTier)?.label}</strong> plan
                </span>
              </div>
            )}
          </div>

          {/* Usage bar */}
          {usage && <UsageSummary usage={usage} />}

          {/* 4 plan cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {UI_PLANS.map((uiPlan) => (
              <PlanCard
                key={uiPlan.tier}
                uiPlan={uiPlan}
                isCurrent={currentTier === uiPlan.tier}
                onSelect={() => {
                  if (uiPlan.isPPF) {
                    setPpfOpen(true);
                    setPpfIframeUrl(null);
                    setPpfQuantity(1);
                  } else {
                    setSelectedSubPlan(uiPlan);
                    setSubIframeUrl(null);
                  }
                }}
              />
            ))}
          </div>

          {/* Token comparison note */}
          <p className="mt-8 text-center text-xs text-neutral-400">
            Buying 3 Pay-Per-Feature sections (≈ 405 EGP) costs more than a Pro plan (350 EGP/mo) — subscribe for better value if you use Bizify regularly.
          </p>

          {/* Cancel */}
          {subscription && (
            <div className="mt-12 text-center">
              <button type="button"
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
                className="text-sm text-neutral-400 hover:text-red-500 transition-colors underline underline-offset-4">
                Cancel current subscription
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Subscription payment modal */}
      {selectedSubPlan && !selectedSubPlan.isPPF && (
        <PaymentModal
          uiPlan={selectedSubPlan}
          onClose={() => { if (!subProcessing) { setSelectedSubPlan(null); setSubIframeUrl(null); } }}
          onPayPal={handleSubPayPal}
          onCard={handleSubCard}
          processing={subProcessing}
          iframeUrl={subIframeUrl}
        />
      )}

      {/* PPF buy modal */}
      {ppfOpen && (
        <PPFModal
          onClose={() => { if (!ppfProcessing) { setPpfOpen(false); setPpfIframeUrl(null); } }}
          onPayPal={handlePpfPayPal}
          onCard={handlePpfCard}
          processing={ppfProcessing}
          iframeUrl={ppfIframeUrl}
          quantity={ppfQuantity}
          setQuantity={setPpfQuantity}
        />
      )}
    </>
  );
}

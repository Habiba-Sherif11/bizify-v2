"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Minus,
  ArrowLeft,
  Zap,
  CreditCard,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/features/entrepreneur/components/DashboardHeader";
import { api } from "@/features/auth/lib/api";
import { cn } from "@/lib/utils";

// ─── Static plan metadata ─────────────────────────────────────────────────────

const FEATURES = [
  { name: "AI idea brainstorming",   free: true,  starter: true,  plus: true,  premium: true  },
  { name: "Market research reports", free: true,  starter: true,  plus: true,  premium: true  },
  { name: "Competitor analysis",     free: false, starter: true,  plus: true,  premium: true  },
  { name: "Business plan builder",   free: false, starter: true,  plus: true,  premium: true  },
  { name: "AI mentor chat",          free: false, starter: true,  plus: true,  premium: true  },
  { name: "Financial projections",   free: false, starter: false, plus: true,  premium: true  },
  { name: "Pitch deck generator",    free: false, starter: false, plus: true,  premium: true  },
  { name: "Priority support",        free: false, starter: false, plus: true,  premium: true  },
  { name: "Custom branding",         free: false, starter: false, plus: false, premium: true  },
  { name: "Advanced AI models",      free: false, starter: false, plus: false, premium: true  },
  { name: "Team collaboration",      free: false, starter: false, plus: false, premium: true  },
  { name: "API access",              free: false, starter: false, plus: false, premium: true  },
] as const;

type FeatureKey = "free" | "starter" | "plus" | "premium";

const PLAN_META: Record<string, { key: FeatureKey; color: string; popular?: boolean; yearlyPrice: number }> = {
  Free:    { key: "free",    color: "#8ECAE6", yearlyPrice: 0  },
  Starter: { key: "starter", color: "#219EBC", yearlyPrice: 15 },
  Plus:    { key: "plus",    color: "#FB8500", popular: true, yearlyPrice: 23 },
  Premium: { key: "premium", color: "#126782", yearlyPrice: 55 },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type BackendPlan = {
  id: string;
  name: string;
  price: number;
  features_json: Record<string, unknown> | null;
  is_active: boolean;
};

type Subscription = {
  id: string;
  plan_id: string;
  status: string;
  plan?: BackendPlan;
};

// ─── Payment Modal ────────────────────────────────────────────────────────────

function PaymentModal({
  plan,
  onClose,
  onPayPal,
  onCard,
  processing,
  iframeUrl,
}: {
  plan: BackendPlan;
  onClose: () => void;
  onPayPal: () => void;
  onCard: () => void;
  processing: boolean;
  iframeUrl: string | null;
}) {
  const meta = PLAN_META[plan.name];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-0.5">
              Subscribe to
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta?.color }} />
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{plan.name}</h2>
              <span className="text-lg font-bold text-neutral-900 dark:text-white">
                ${plan.price}
                <span className="text-sm font-normal text-neutral-400">/mo</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={processing}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Iframe (Paymob card) */}
        {iframeUrl ? (
          <div className="p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3 text-center">
              Enter your card details below
            </p>
            <iframe
              src={iframeUrl}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700"
              style={{ height: 420 }}
              title="Card payment"
            />
          </div>
        ) : (
          /* Payment method selection */
          <div className="p-5 space-y-3">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Choose your payment method
            </p>

            {/* PayPal */}
            <button
              onClick={onPayPal}
              disabled={processing}
              className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#003087] flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm" style={{ fontFamily: "Arial, sans-serif" }}>
                    P
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">PayPal</p>
                  <p className="text-xs text-neutral-400">Pay securely with your PayPal account</p>
                </div>
              </div>
              {processing ? (
                <Loader2 size={16} className="text-amber-500 animate-spin shrink-0" />
              ) : (
                <Zap size={16} className="text-neutral-300 group-hover:text-amber-400 transition-colors shrink-0" />
              )}
            </button>

            {/* Card */}
            <button
              onClick={onCard}
              disabled={processing}
              className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-cyan-400 dark:hover:border-cyan-500 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
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
              {processing ? (
                <Loader2 size={16} className="text-cyan-500 animate-spin shrink-0" />
              ) : (
                <CreditCard size={16} className="text-neutral-300 group-hover:text-cyan-400 transition-colors shrink-0" />
              )}
            </button>

            <p className="text-xs text-center text-neutral-400 dark:text-neutral-500 pt-1">
              Payments are secure and encrypted
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  billing,
  isCurrent,
  onSelect,
}: {
  plan: BackendPlan;
  billing: "monthly" | "yearly";
  isCurrent: boolean;
  onSelect: () => void;
}) {
  const meta = PLAN_META[plan.name];
  const displayPrice = billing === "yearly" ? (meta?.yearlyPrice ?? plan.price) : plan.price;
  const featureKey = meta?.key ?? "free";
  const isFree = plan.name === "Free";

  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 flex flex-col transition-all duration-200",
        meta?.popular
          ? "ring-2 ring-amber-400 dark:ring-amber-500 bg-white dark:bg-neutral-800 shadow-lg"
          : "border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/60",
        isCurrent && "ring-2 ring-green-400 dark:ring-green-500"
      )}
    >
      {/* Badges */}
      {meta?.popular && !isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-white text-[0.65rem] font-bold uppercase tracking-wide">
          Popular
        </span>
      )}
      {isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-green-500 text-white text-[0.65rem] font-bold uppercase tracking-wide flex items-center gap-1">
          <CheckCircle2 size={10} />
          Current Plan
        </span>
      )}

      {/* Name + price */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: meta?.color }} />
        <h3 className="font-semibold text-neutral-900 dark:text-white">{plan.name}</h3>
      </div>

      <div className="flex items-baseline gap-1 mb-5">
        <span className="text-3xl font-bold text-neutral-900 dark:text-white">${displayPrice}</span>
        <span className="text-sm text-neutral-400">/mo</span>
        {billing === "yearly" && !isFree && (
          <span className="ml-1 text-xs text-green-500 font-medium">Save 20%</span>
        )}
      </div>

      {/* CTA */}
      <Button
        onClick={onSelect}
        disabled={isCurrent || isFree}
        variant={meta?.popular ? "primary-gradient" : "outline"}
        className={cn(
          "w-full mb-5",
          !meta?.popular && "border-cyan-600 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-700 dark:border-cyan-500 dark:text-cyan-400 dark:hover:bg-cyan-950/30",
          isCurrent && "border-green-500 text-green-600 dark:text-green-400 cursor-default",
          isFree && "opacity-60 cursor-default"
        )}
      >
        {isCurrent ? "Current Plan" : isFree ? "Free" : `Upgrade to ${plan.name}`}
      </Button>

      {/* Features */}
      <div className="space-y-2.5 border-t border-neutral-100 dark:border-neutral-700 pt-5 flex-1">
        {FEATURES.map((feature) => {
          const included = feature[featureKey];
          return (
            <div key={feature.name} className="flex items-start gap-2">
              {included ? (
                <Check
                  size={15}
                  strokeWidth={2.5}
                  className="mt-0.5 shrink-0"
                  style={{ color: meta?.color }}
                />
              ) : (
                <Minus size={14} strokeWidth={1.5} className="text-neutral-300 dark:text-neutral-600 mt-0.5 shrink-0" />
              )}
              <span
                className={cn(
                  "text-sm leading-snug",
                  included ? "text-neutral-700 dark:text-neutral-200" : "text-neutral-400 dark:text-neutral-500"
                )}
              >
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
  const [plans, setPlans] = useState<BackendPlan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const [selectedPlan, setSelectedPlan] = useState<BackendPlan | null>(null);
  const [processing, setProcessing] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, subRes] = await Promise.allSettled([
        api.get("/billing/plans"),
        api.get("/billing/subscription"),
      ]);
      if (plansRes.status === "fulfilled") setPlans(plansRes.value.data);
      if (subRes.status === "fulfilled") setSubscription(subRes.value.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePayPal = async () => {
    if (!selectedPlan) return;
    setProcessing(true);
    try {
      const { data } = await api.post("/billing/paypal/subscribe", { plan_id: selectedPlan.id });
      sessionStorage.setItem("paypal_plan_id", selectedPlan.id);
      sessionStorage.setItem("paypal_plan_name", selectedPlan.name);
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
    if (!selectedPlan) return;
    setProcessing(true);
    try {
      const { data } = await api.post("/billing/paymob/subscribe", { plan_id: selectedPlan.id });
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

  const closeModal = () => {
    if (processing) return;
    setSelectedPlan(null);
    setIframeUrl(null);
  };

  const currentPlanId = subscription?.plan_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <DashboardHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="animate-spin text-amber-500" />
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
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-full">
              <Zap size={13} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                Subscription Plans
              </span>
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">
              Choose the right plan for you
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
              Unlock powerful AI tools to grow your startup. Upgrade or downgrade any time.
            </p>

            {/* Current plan badge */}
            {subscription?.plan?.name && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-full">
                <CheckCircle2 size={13} className="text-green-500" />
                <span className="text-sm text-green-700 dark:text-green-400">
                  You&apos;re on the <strong>{subscription.plan.name}</strong> plan
                </span>
              </div>
            )}
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="inline-flex rounded-full p-0.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => setBilling("monthly")}
                className={cn(
                  "px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                  billing === "monthly"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={cn(
                  "px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                  billing === "yearly"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                )}
              >
                Yearly
              </button>
            </div>
            {billing === "yearly" && (
              <span className="px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 text-xs font-semibold">
                Save 20%
              </span>
            )}
          </div>

          {/* Plan cards */}
          {plans.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 dark:text-neutral-500">
              No plans available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  billing={billing}
                  isCurrent={plan.id === currentPlanId}
                  onSelect={() => handleSelectPlan(plan)}
                />
              ))}
            </div>
          )}

          {/* Cancel subscription link */}
          {subscription && (
            <div className="mt-12 text-center">
              <button
                onClick={handleCancelSubscription}
                className="text-sm text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 transition-colors underline underline-offset-4"
              >
                Cancel current subscription
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Payment modal */}
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={closeModal}
          onPayPal={handlePayPal}
          onCard={handleCard}
          processing={processing}
          iframeUrl={iframeUrl}
        />
      )}
    </>
  );

  function handleSelectPlan(plan: BackendPlan) {
    if (plan.name === "Free" || plan.id === currentPlanId) return;
    setSelectedPlan(plan);
    setIframeUrl(null);
  }

  async function handleCancelSubscription() {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    try {
      await api.delete("/billing/subscription");
      toast.success("Subscription cancelled successfully.");
      setSubscription(null);
    } catch {
      toast.error("Failed to cancel subscription. Please try again.");
    }
  }
}

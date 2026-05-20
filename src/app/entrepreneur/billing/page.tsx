"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Home, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { api } from "@/features/auth/lib/api";
import { parseBackendError } from "@/lib/backend-error";

type Plan = {
  id: string;
  name: string;
  price: number;
  currency?: string;
  interval?: string;
  features_json?: Record<string, unknown> | null;
  description?: string | null;
  is_active?: boolean;
};

type Subscription = {
  id?: string;
  plan_id?: string;
  status?: "PENDING" | "ACTIVE" | "CANCELED" | string;
  start_date?: string;
  end_date?: string;
  plan?: Plan;
} | null;

type ProviderResp = {
  approval_url?: string;
  payment_url?: string;
  redirect_url?: string;
  iframe_url?: string;
  url?: string;
};

function getErr(err: unknown, fallback: string) {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  return data ? parseBackendError(data) : fallback;
}

function featureList(plan: Plan): string[] {
  const f = plan.features_json;
  if (!f) return [];
  if (Array.isArray(f)) return f.map(String);
  return Object.entries(f).map(([k, v]) => `${k}: ${String(v)}`);
}

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription>(null);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [provider, setProvider] = useState<"paypal" | "paymob">("paypal");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, subRes] = await Promise.allSettled([
        api.get<Plan[]>("/billing/plans"),
        api.get<Subscription>("/billing/subscription"),
      ]);
      if (plansRes.status === "fulfilled") {
        setPlans(Array.isArray(plansRes.value.data) ? plansRes.value.data : []);
      }
      if (subRes.status === "fulfilled") {
        setSubscription(subRes.value.data ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const handleSubscribe = async (plan: Plan) => {
    setActingOn(plan.id);
    try {
      const endpoint =
        provider === "paypal" ? "/billing/paypal/subscribe" : "/billing/paymob/subscribe";
      const { data } = await api.post<ProviderResp>(endpoint, { plan_id: plan.id });
      const redirect =
        data.approval_url ?? data.payment_url ?? data.redirect_url ?? data.iframe_url ?? data.url;
      if (redirect) {
        // eslint-disable-next-line react-hooks/immutability
        window.location.href = redirect;
      } else {
        toast.success("Subscription started — check your email.");
        refresh();
      }
    } catch (err) {
      toast.error(getErr(err, "Failed to start subscription"));
    } finally {
      setActingOn(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel your subscription?")) return;
    setActingOn("cancel");
    try {
      await api.delete("/billing/subscription");
      toast.success("Subscription canceled");
      refresh();
    } catch (err) {
      toast.error(getErr(err, "Failed to cancel subscription"));
    } finally {
      setActingOn(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={24} />
      </div>
    );
  }

  const activeSub = subscription && subscription.status === "ACTIVE";

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <nav className="flex items-center gap-1.5 pt-6 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/entrepreneur" className="hover:text-gray-700 dark:hover:text-gray-200">
            <Home size={14} />
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200 font-medium">Billing</span>
        </nav>

        <div className="mt-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-white">
            Billing &amp; subscription
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your plan and payment method.
          </p>
        </div>

        {/* Current subscription */}
        <section className="mt-6 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500 font-medium">
                Current plan
              </p>
              <p className="mt-1 text-xl font-semibold text-neutral-900 dark:text-white">
                {activeSub
                  ? subscription?.plan?.name ?? "Active plan"
                  : "No active plan"}
              </p>
              {activeSub && subscription?.end_date && (
                <p className="text-xs text-neutral-500 mt-1">
                  Renews {new Date(subscription.end_date).toLocaleDateString()}
                </p>
              )}
            </div>
            {activeSub && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={actingOn === "cancel"}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 dark:bg-neutral-900/50 dark:text-red-300 dark:border-red-900 cursor-pointer disabled:opacity-50"
              >
                {actingOn === "cancel" ? "Canceling…" : "Cancel subscription"}
              </button>
            )}
          </div>
        </section>

        {/* Payment provider toggle */}
        <div className="mt-6 inline-flex rounded-lg border border-neutral-200 dark:border-neutral-700 p-1 bg-white dark:bg-neutral-800">
          {(["paypal", "paymob"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProvider(p)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer ${
                provider === p
                  ? "bg-amber-500 text-white"
                  : "text-neutral-600 dark:text-neutral-300"
              }`}
            >
              {p === "paypal" ? "PayPal" : "Paymob"}
            </button>
          ))}
        </div>

        {/* Plans */}
        <h2 className="mt-8 text-lg font-semibold text-neutral-900 dark:text-white">
          Available plans
        </h2>

        {plans.length === 0 ? (
          <div className="mt-4 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 py-12 text-center">
            <p className="text-sm text-neutral-500">No plans available yet.</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = activeSub && subscription?.plan_id === plan.id;
              const features = featureList(plan);
              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-5 bg-white dark:bg-neutral-800 ${
                    isCurrent
                      ? "border-amber-400 ring-1 ring-amber-400"
                      : "border-neutral-200 dark:border-neutral-700"
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      {plan.name}
                    </h3>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
                    {plan.currency ?? "$"}
                    {plan.price}
                    <span className="text-sm font-normal text-neutral-500">
                      /{plan.interval ?? "mo"}
                    </span>
                  </p>
                  {plan.description && (
                    <p className="mt-2 text-sm text-neutral-500">{plan.description}</p>
                  )}

                  {features.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                          <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSubscribe(plan)}
                    disabled={isCurrent || actingOn === plan.id}
                    className={`mt-5 w-full px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 ${
                      isCurrent
                        ? "bg-neutral-100 dark:bg-neutral-700 text-neutral-500"
                        : "bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
                    }`}
                  >
                    {isCurrent
                      ? "Current plan"
                      : actingOn === plan.id
                        ? "Starting…"
                        : `Subscribe with ${provider === "paypal" ? "PayPal" : "Paymob"}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

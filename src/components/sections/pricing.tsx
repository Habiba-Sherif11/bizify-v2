"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Zap, ArrowRight, Infinity } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

// All features — every plan gets all of them. Only tokens differ.
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

type PlanKey = "free" | "ppf" | "pro" | "premium";

interface Plan {
  key:       PlanKey;
  name:      string;
  subtitle:  string;
  monthly:   number;
  yearly:    number;
  currency:  string;
  priceLabel: string;          // shown under the price number
  tokens:    string;           // human-readable token budget
  tokenNote: string;           // small note under token badge
  cta:       string;
  popular?:  boolean;
  color:     string;           // accent color
  isPPF?:    boolean;          // special PPF rendering
}

const PLANS: Plan[] = [
  {
    key:        "free",
    name:       "Free",
    subtitle:   "Try everything, no card needed",
    monthly:    0,
    yearly:     0,
    currency:   "",
    priceLabel: "forever",
    tokens:     "15K",
    tokenNote:  "≈ 1 full analysis",
    cta:        "Start for free",
    color:      "#8ECAE6",
  },
  {
    key:        "ppf",
    name:       "Pay-Per-Feature",
    subtitle:   "Pay only for what you use",
    monthly:    135,
    yearly:     115,
    currency:   "EGP",
    priceLabel: "per section",
    tokens:     "3K",
    tokenNote:  "per section purchased",
    cta:        "Buy a section",
    popular:    true,
    color:      "#FB8500",
    isPPF:      true,
  },
  {
    key:        "pro",
    name:       "Pro",
    subtitle:   "For active founders",
    monthly:    350,
    yearly:     280,
    currency:   "EGP",
    priceLabel: "per month",
    tokens:     "150K",
    tokenNote:  "≈ 10 full analyses / mo",
    cta:        "Get Pro",
    color:      "#219EBC",
  },
  {
    key:        "premium",
    name:       "Premium",
    subtitle:   "Everything, unlimited",
    monthly:    600,
    yearly:     480,
    currency:   "EGP",
    priceLabel: "per month",
    tokens:     "∞",
    tokenNote:  "Unlimited analyses",
    cta:        "Get Premium",
    color:      "#126782",
  },
];

export function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="pricing" className="relative w-full py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50 overflow-hidden">
      {/* Background blobs */}
      <div
        className="absolute top-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full opacity-[0.07] pointer-events-none"
        style={{ background: "#FB8500", filter: "blur(100px)" }}
      />
      <div
        className="absolute bottom-[-100px] left-[-60px] w-[350px] h-[350px] rounded-full opacity-[0.06] pointer-events-none"
        style={{ background: "#219EBC", filter: "blur(100px)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-block px-4 py-1.5 mb-6 bg-white border border-amber-500 rounded-full">
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wide">Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-950 mb-4">
            All features. Every plan.
          </h2>
          <p className="text-base sm:text-lg text-neutral-500 max-w-xl mx-auto mb-6">
            The only difference between plans is how many AI tokens you get.
            Every plan unlocks every feature — no gatekeeping.
          </p>

          {/* Billing toggle — only applies to Pro & Premium */}
          <div className="flex items-center justify-center gap-3">
            <div className="inline-flex rounded-full p-0.5 bg-white/80 backdrop-blur-sm border border-neutral-200">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer text-[0.8rem] font-medium ${
                  billing === "monthly" ? "bg-amber-500 text-white shadow-sm" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer text-[0.8rem] font-medium ${
                  billing === "yearly" ? "bg-amber-500 text-white shadow-sm" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Yearly
              </button>
            </div>
            {billing === "yearly" && (
              <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-amber-600 text-[0.7rem] font-semibold">
                Save 20%
              </span>
            )}
          </div>
        </motion.div>

        {/* Plan cards — 4 columns on desktop, 1/2 on mobile */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-2xl p-6 ${
                plan.popular
                  ? "ring-2 ring-amber-500 bg-white shadow-xl shadow-amber-100/40"
                  : "bg-white/70 border border-neutral-200"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-white text-[0.62rem] font-bold uppercase tracking-wider whitespace-nowrap"
                >
                  ★ Most Popular
                </span>
              )}

              {/* Plan name */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: plan.color }} />
                <p className="font-bold text-neutral-900 text-[0.95rem]">{plan.name}</p>
              </div>
              <p className="text-[0.75rem] text-neutral-400 mb-4">{plan.subtitle}</p>

              {/* Token badge */}
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-5 self-start"
                style={{ background: `${plan.color}18` }}
              >
                {plan.tokens === "∞" ? (
                  <Infinity size={12} style={{ color: plan.color }} strokeWidth={2.5} />
                ) : (
                  <Zap size={11} style={{ color: plan.color }} strokeWidth={2.5} />
                )}
                <span className="text-[0.72rem] font-semibold" style={{ color: plan.color }}>
                  {plan.tokens} tokens
                </span>
              </div>

              {/* Price */}
              <div className="mb-5">
                {plan.monthly === 0 ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-[2rem] font-bold text-neutral-900 leading-none">Free</span>
                    <span className="text-[0.75rem] text-neutral-400 ml-1">{plan.priceLabel}</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-[2rem] font-bold text-neutral-900 leading-none">
                      {plan.isPPF
                        ? billing === "yearly" ? plan.yearly : plan.monthly
                        : billing === "yearly" ? plan.yearly : plan.monthly}
                    </span>
                    <span className="text-[0.75rem] text-neutral-400 ml-0.5">
                      {plan.currency} {plan.priceLabel}
                    </span>
                  </div>
                )}
                <p className="text-[0.7rem] text-neutral-400 mt-0.5">{plan.tokenNote}</p>
                {plan.isPPF && billing === "yearly" && (
                  <p className="text-[0.7rem] text-amber-500 font-medium mt-0.5">15% bundle discount on 3+</p>
                )}
                {!plan.isPPF && plan.monthly > 0 && billing === "yearly" && (
                  <p className="text-[0.7rem] text-amber-500 font-medium mt-0.5">
                    Save {plan.monthly - plan.yearly} EGP/mo
                  </p>
                )}
              </div>

              {/* CTA */}
              <Button
                asChild
                variant={plan.popular ? "primary-gradient" : "outline"}
                size="default"
                className={`w-full mb-6 ${
                  !plan.popular
                    ? "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    : ""
                }`}
              >
                <Link href="/signup">{plan.cta}</Link>
              </Button>

              {/* All features — always all ticked */}
              <div className="border-t border-neutral-100 pt-5 space-y-2 flex-1">
                <p className="text-[0.72rem] font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                  All features included
                </p>
                {ALL_FEATURES.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check
                      size={13}
                      strokeWidth={2.5}
                      className="mt-0.5 shrink-0"
                      style={{ color: plan.color }}
                    />
                    <span className="text-[0.8rem] text-neutral-600">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Token comparison row */}
        <motion.div
          className="rounded-2xl bg-white border border-neutral-200 p-5 mb-10 overflow-x-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        >
          <p className="text-[0.75rem] font-semibold text-neutral-400 uppercase tracking-wider mb-4">
            Token budgets at a glance
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PLANS.map((plan) => (
              <div key={plan.key} className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: plan.color }} />
                  <span className="text-[0.78rem] font-semibold text-neutral-700">{plan.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {plan.tokens === "∞" ? (
                    <Infinity size={14} style={{ color: plan.color }} strokeWidth={2} />
                  ) : (
                    <Zap size={12} style={{ color: plan.color }} strokeWidth={2.5} />
                  )}
                  <span className="text-[0.85rem] font-bold" style={{ color: plan.color }}>
                    {plan.tokens}
                  </span>
                  <span className="text-[0.72rem] text-neutral-400">tokens</span>
                </div>
                <span className="text-[0.7rem] text-neutral-400">{plan.tokenNote}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* PPF anchor note */}
        <motion.p
          className="text-center text-[0.75rem] text-neutral-400 mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          Buying 3 Pay-Per-Feature sections (405 EGP) costs more than a Pro plan (350 EGP/mo) —
          subscribe for better value if you use Bizify regularly.
        </motion.p>

        {/* Bottom CTA */}
        <motion.div
          className="mt-4 relative"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          <div
            className="rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden bg-white/60 backdrop-blur-md border border-white/80"
            style={{ boxShadow: "0 0 0 1px rgba(251,133,0,0.08), 0 8px 40px rgba(251,133,0,0.06)" }}
          >
            <div
              className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full opacity-[0.08] pointer-events-none"
              style={{ background: "#FD9E02", filter: "blur(60px)" }}
            />
            <div className="relative z-10">
              <h2 className="text-neutral-900 mb-2 text-xl sm:text-2xl font-semibold">
                Still not sure which plan is right for you?
              </h2>
              <p className="text-neutral-500 mb-6 max-w-md mx-auto text-sm">
                Our team is here to help. Get a personalized recommendation based on your business needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild variant="primary-gradient" size="lg" className="w-full sm:w-auto justify-center">
                  <Link href="/signup">
                    Talk to sales
                    <ArrowRight size={15} />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg"
                  className="w-full sm:w-auto border-cyan-600 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-700">
                  <Link href="/signup">Start for free</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

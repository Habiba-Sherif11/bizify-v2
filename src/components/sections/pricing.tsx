"use client";

// External libraries
import Link from "next/link";
import { useState } from "react";
import { Check, Minus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

// Feature and plan data
const FEATURES = [
  { name: "AI idea brainstorming", free: true, starter: true, plus: true, premium: true },
  { name: "Market research reports", free: true, starter: true, plus: true, premium: true },
  { name: "Competitor analysis", free: false, starter: true, plus: true, premium: true },
  { name: "Business plan builder", free: false, starter: true, plus: true, premium: true },
  { name: "AI mentor chat", free: false, starter: true, plus: true, premium: true },
  { name: "Financial projections", free: false, starter: false, plus: true, premium: true },
  { name: "Pitch deck generator", free: false, starter: false, plus: true, premium: true },
  { name: "Milestone tracking", free: false, starter: false, plus: true, premium: true },
  { name: "Priority support", free: false, starter: false, plus: true, premium: true },
  { name: "Custom branding on reports", free: false, starter: false, plus: false, premium: true },
  { name: "Advanced AI models", free: false, starter: false, plus: false, premium: true },
  { name: "Team collaboration", free: false, starter: false, plus: false, premium: true },
  { name: "Dedicated AI advisor", free: false, starter: false, plus: false, premium: true },
  { name: "API access", free: false, starter: false, plus: false, premium: true },
  { name: "White-label reports", free: false, starter: false, plus: false, premium: true },
];

const PLANS = [
  { key: "free" as const, name: "Free", monthly: 0, yearly: 0, cta: "Sign up", color: "#8ECAE6" },
  { key: "starter" as const, name: "Starter", monthly: 19, yearly: 15, cta: "Try for free", color: "#219EBC" },
  { key: "plus" as const, name: "Plus", monthly: 29, yearly: 23, cta: "Try for free", popular: true, color: "#FB8500" },
  { key: "premium" as const, name: "Premium", monthly: 69, yearly: 55, cta: "Try for free", color: "#126782" },
];

export function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="pricing" className="relative w-full py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50">
      {/* Background blobs */}
      <div
        className="absolute top-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full opacity-[0.07]"
        style={{ background: "#FB8500", filter: "blur(100px)" }}
      />
      <div
        className="absolute bottom-[-100px] left-[-60px] w-[350px] h-[350px] rounded-full opacity-[0.06]"
        style={{ background: "#219EBC", filter: "blur(100px)" }}
      />
      <div
        className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full opacity-[0.04]"
        style={{ background: "#FFB703", filter: "blur(120px)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-950 mb-4">
            Start free. Grow when you&apos;re ready.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto mb-6">
            Every plan includes a free trial — no credit card required.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3">
            <div className="inline-flex rounded-full p-0.5 bg-white/80 backdrop-blur-sm border border-neutral-200">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  billing === "monthly"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
                style={{ fontSize: "0.8rem", fontWeight: 500 }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  billing === "yearly"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
                style={{ fontSize: "0.8rem", fontWeight: 500 }}
              >
                Yearly
              </button>
            </div>
            {billing === "yearly" && (
              <span
                className="px-2 py-0.5 rounded-full bg-yellow-100 text-amber-600"
                style={{ fontSize: "0.7rem", fontWeight: 600 }}
              >
                Save 20%
              </span>
            )}
          </div>
        </motion.div>

        {/* Desktop Comparison Table */}
        <motion.div
          className="hidden lg:block overflow-x-auto -mx-4 px-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          <table className="w-full border-collapse" style={{ minWidth: 720 }}>
            <thead>
              <tr>
                <th className="text-left pb-6" style={{ width: "34%" }} />
                {PLANS.map((plan) => (
                  <th key={plan.key} className="pb-0 px-1.5 align-bottom text-left" style={{ width: "16.5%" }}>
                    <div
                      className={`relative rounded-xl p-4 pb-5 ${
                        plan.popular
                          ? "bg-white/70 backdrop-blur-md border border-amber-500/20 shadow-sm"
                          : "bg-white/50 backdrop-blur-sm border border-neutral-200"
                      }`}
                    >
                      {plan.popular && (
                        <span
                          className="inline-block mb-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-600"
                          style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.03em" }}
                        >
                          POPULAR
                        </span>
                      )}
                      {!plan.popular && <div className="mb-2 h-[22px]" />}

                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: plan.color }} />
                        <p className="text-neutral-900" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                          {plan.name}
                        </p>
                      </div>

                      <div className="flex items-baseline gap-0.5 mt-1 mb-3">
                        <span
                          className="text-neutral-900"
                          style={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1 }}
                        >
                          ${billing === "monthly" ? plan.monthly : plan.yearly}
                        </span>
                        <span className="text-neutral-400 ml-0.5" style={{ fontSize: "0.75rem" }}>
                          /mo
                        </span>
                      </div>

                      <Button
                        asChild
                        variant={plan.popular ? "primary-gradient" : "outline"}
                        size="default"
                        className={`w-full ${!plan.popular ? "border-cyan-600 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-700" : ""}`}
                      >
                        <Link href="/signup">{plan.cta}</Link>
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="h-4" colSpan={5} />
              </tr>
              {FEATURES.map((feature, idx) => (
                <tr
                  key={feature.name}
                  className={`${idx !== 0 ? "border-t border-neutral-100" : ""}`}
                >
                  <td className="py-3 pr-4 text-neutral-600" style={{ fontSize: "0.84rem" }}>
                    {feature.name}
                  </td>
                  {PLANS.map((plan) => {
                    const value = feature[plan.key];
                    return (
                      <td key={plan.key} className="py-3 px-2 text-center">
                        {value ? (
                          <Check
                            size={16}
                            strokeWidth={2.5}
                            style={{ color: plan.popular ? "#FB8500" : plan.color }}
                          />
                        ) : (
                          <Minus size={14} strokeWidth={1.5} className="text-neutral-300" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Mobile & Tablet Cards */}
        <motion.div
          className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-2xl p-6 ${
                plan.popular
                  ? "ring-2 ring-amber-500 bg-white/70 backdrop-blur-md shadow-lg"
                  : "bg-white/50 backdrop-blur-sm border border-neutral-200"
              }`}
            >
              {plan.popular && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-600"
                  style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.03em" }}
                >
                  POPULAR
                </span>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: plan.color }} />
                <p className="text-neutral-900" style={{ fontSize: "1rem", fontWeight: 600 }}>
                  {plan.name}
                </p>
              </div>

              <div className="flex items-baseline gap-0.5 mb-4">
                <span className="text-neutral-900" style={{ fontSize: "2rem", fontWeight: 700 }}>
                  ${billing === "monthly" ? plan.monthly : plan.yearly}
                </span>
                <span className="text-neutral-400" style={{ fontSize: "0.8rem" }}>/mo</span>
              </div>

              <Button
                asChild
                variant={plan.popular ? "primary-gradient" : "outline"}
                size="lg"
                className={`w-full mb-6 ${!plan.popular ? "border-cyan-600 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-700" : ""}`}
              >
                <Link href="/signup">{plan.cta}</Link>
              </Button>

              <div className="space-y-3 border-t border-neutral-100 pt-6">
                {FEATURES.map((feature) => (
                  <div key={feature.name} className="flex items-start gap-2">
                    {feature[plan.key] ? (
                      <Check
                        size={16}
                        strokeWidth={2.5}
                        className="mt-0.5 shrink-0"
                        style={{ color: plan.color }}
                      />
                    ) : (
                      <Minus
                        size={14}
                        strokeWidth={1.5}
                        className="text-neutral-300 mt-0.5 shrink-0"
                      />
                    )}
                    <span
                      className={`text-sm ${
                        feature[plan.key] ? "text-neutral-700" : "text-neutral-400"
                      }`}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-10 relative"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          <div
            className="rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden bg-white/60 backdrop-blur-md border border-white/80"
            style={{
              boxShadow: "0 0 0 1px rgba(251,133,0,0.08), 0 8px 40px rgba(251,133,0,0.06)",
            }}
          >
            <div
              className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full opacity-[0.08]"
              style={{ background: "#FD9E02", filter: "blur(60px)" }}
            />
            <div
              className="absolute bottom-[-30px] left-[-30px] w-[160px] h-[160px] rounded-full opacity-[0.06]"
              style={{ background: "#8ECAE6", filter: "blur(60px)" }}
            />

            <div className="relative z-10">
              <h2 className="text-neutral-900 mb-2 text-xl sm:text-2xl" style={{ fontWeight: 600 }}>
                Every plan includes a free trial.
              </h2>
              <p className="text-neutral-600 mb-6 max-w-md mx-auto text-sm sm:text-base">
                Start for free, upgrade when you&apos;re ready. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  asChild
                  variant="primary-gradient"
                  size="lg"
                  className="w-full sm:w-auto justify-center"
                >
                  <Link href="/signup">
                    Start free
                    <ArrowRight size={15} />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-cyan-600 text-cyan-600 hover:bg-cyan-50 hover:border-cyan-700"
                >
                  <Link href="/signup">Compare all features</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";

const cardShadow      = "0 2px 8px -2px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.06)";
const cardHoverShadow = "0 16px 28px -8px rgba(0,0,0,0.13), 0 0 1px rgba(0,0,0,0.06)";

// ── Inline AI chat preview ────────────────────────────────────────────────────
function AIChatPreview() {
  return (
    <div
      className="mt-6 rounded-xl border border-neutral-100 bg-neutral-50 overflow-hidden text-left"
      aria-label="Example AI research output"
    >
      {/* User prompt */}
      <div className="px-4 pt-4 pb-3 flex items-start gap-3">
        <span
          className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700"
          aria-hidden="true"
          style={{ fontSize: "0.6rem", fontWeight: 700 }}
        >
          You
        </span>
        <p className="text-sm text-neutral-600 leading-snug">
          Who are the main competitors for a student meal-planning app in Egypt?
        </p>
      </div>

      {/* AI response */}
      <div className="border-t border-neutral-100 px-4 py-4 flex items-start gap-3">
        <span
          className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center"
          aria-hidden="true"
          style={{ fontSize: "0.55rem", fontWeight: 700, color: "#fff" }}
        >
          AI
        </span>
        <div className="space-y-2.5 flex-1">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            3 direct competitors found
          </p>
          {[
            { name: "Elmenus", insight: "Restaurant discovery focus, no meal-planning or budgeting tools." },
            { name: "Otlob",   insight: "Delivery-led; no student pricing or dietary customisation." },
            { name: "Talabat", insight: "Dominant in delivery; gap in affordable weekly planning." },
          ].map(({ name, insight }) => (
            <div key={name} className="flex gap-2 items-start">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
              <p className="text-sm text-neutral-700 leading-snug">
                <strong className="font-semibold text-neutral-900">{name}</strong>
                {" — "}
                {insight}
              </p>
            </div>
          ))}
          <p className="text-xs text-neutral-400 pt-1">Sources cited · Updated today</p>
        </div>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function Solutions() {
  return (
    <section id="features" className="relative py-16 px-4 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-5xl mx-auto">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-950 max-w-lg leading-tight">
            Everything you need, built in.
          </h2>
          <p className="mt-4 text-base text-neutral-500 max-w-md">
            Bizify replaces the scattered stack with one focused workspace.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Flagship: AI Research — 2 cols, full product preview */}
          <motion.div
            className="lg:col-span-2 rounded-xl border border-neutral-200/80 bg-background p-6 cursor-default"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ y: -4, boxShadow: cardHoverShadow }}
            style={{ boxShadow: cardShadow }}
          >
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3">
              AI Research
            </p>
            <h3 className="text-xl font-semibold text-neutral-950 leading-snug mb-1">
              Days of research — done in seconds.
            </h3>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-lg">
              Ask about your market. Get competitor analysis, audience insights, and trend
              signals — all cited, all current. No tab switching.
            </p>
            <AIChatPreview />
          </motion.div>

          {/* Validate */}
          <motion.div
            className="rounded-xl border border-neutral-200/80 bg-background p-6 cursor-default flex flex-col justify-between"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            whileHover={{ y: -4, boxShadow: cardHoverShadow }}
            style={{ boxShadow: cardShadow }}
          >
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
                Idea Validation
              </p>
              <h3 className="text-base font-semibold text-neutral-950 mb-2.5 leading-snug">
                Know if your idea has legs — before you commit.
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Structured frameworks that score your idea against real market signals, not gut feel.
              </p>
            </div>
            {/* Visual: simple score bar */}
            <div className="mt-6 space-y-2" aria-hidden="true">
              {[
                { label: "Market size", w: "72%" },
                { label: "Competition",  w: "45%" },
                { label: "Demand signal", w: "88%" },
              ].map(({ label, w }) => (
                <div key={label}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-xs text-neutral-400">{label}</span>
                    <span className="text-xs font-medium text-neutral-600">{w}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: w }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* All in one */}
          <motion.div
            className="rounded-xl border border-neutral-200/80 bg-background p-6 cursor-default"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            whileHover={{ y: -4, boxShadow: cardHoverShadow }}
            style={{ boxShadow: cardShadow }}
          >
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
              One Platform
            </p>
            <h3 className="text-base font-semibold text-neutral-950 mb-2.5 leading-snug">
              No more juggling six tools to find one answer.
            </h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Plans, research, competitor tracking, and milestones — all in the same place you already are.
            </p>
          </motion.div>

          {/* Expert Guidance — amber tint, 2 cols */}
          <motion.div
            className="lg:col-span-2 rounded-xl border border-amber-200/60 bg-amber-50/60 p-6 cursor-default"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            whileHover={{ y: -4, boxShadow: "0 16px 28px -8px rgba(245,158,11,0.18)" }}
            style={{ boxShadow: "0 2px 8px -2px rgba(245,158,11,0.10)" }}
          >
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3">
              AI Advisor
            </p>
            <h3 className="text-base sm:text-lg font-semibold text-neutral-950 mb-2.5 leading-snug">
              An advisor in your pocket — without the six-figure fee.
            </h3>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-lg">
              Personalized guidance tailored to your idea, your market, and your next step. Not generic advice. Yours.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

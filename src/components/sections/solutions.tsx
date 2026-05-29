"use client";

import { motion } from "framer-motion";
import { Zap, Target, BarChart3, TrendingUp } from "lucide-react";

const cardShadow = "0 2px 8px -2px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.06)";
const cardHoverShadow = "0 16px 28px -8px rgba(0,0,0,0.13), 0 0 1px rgba(0,0,0,0.06)";
const amberCardShadow = "0 2px 8px -2px rgba(245,158,11,0.10)";
const amberCardHoverShadow = "0 16px 28px -8px rgba(245,158,11,0.18)";

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

        {/* Bento grid — row 1: large + small, row 2: small + large */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: AI Research — 2 cols wide */}
          <motion.div
            className="sm:col-span-2 rounded-xl border border-neutral-200/80 bg-background p-6 cursor-default"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ y: -4, boxShadow: cardHoverShadow }}
            style={{ boxShadow: cardShadow }}
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                Flagship
              </span>
            </div>
            <h3 className="text-xl font-semibold text-neutral-950 mb-3 leading-snug">
              AI research that takes days — done in seconds.
            </h3>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-lg">
              Ask about your market. Get competitor analysis, audience insights, and trend signals — all cited, all current. No tab switching.
            </p>

            <ul className="mt-5 pt-5 border-t border-neutral-100 space-y-2">
              {[
                "Competitor analysis in under a minute",
                "Real-time trend signals, not stale reports",
                "Every answer cited so you can verify it",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-neutral-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Card 2: Validate Fast — 1 col */}
          <motion.div
            className="rounded-xl border border-neutral-200/80 bg-background p-6 cursor-default"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            whileHover={{ y: -4, boxShadow: cardHoverShadow }}
            style={{ boxShadow: cardShadow }}
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center mb-5">
              <Target className="w-4 h-4 text-cyan-700" />
            </div>
            <h3 className="text-base font-semibold text-neutral-950 mb-2.5 leading-snug">
              Validate before you commit.
            </h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Structured frameworks that tell you if your idea has legs — before you spend a single dollar.
            </p>
          </motion.div>

          {/* Card 3: All Tools — 1 col */}
          <motion.div
            className="rounded-xl border border-neutral-200/80 bg-background p-6 cursor-default"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            whileHover={{ y: -4, boxShadow: cardHoverShadow }}
            style={{ boxShadow: cardShadow }}
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center mb-5">
              <BarChart3 className="w-4 h-4 text-neutral-600" />
            </div>
            <h3 className="text-base font-semibold text-neutral-950 mb-2.5 leading-snug">
              One platform. No more juggling.
            </h3>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Plans, research, competitor tracking, and milestones — all where you already are.
            </p>
          </motion.div>

          {/* Card 4: Expert Guidance — 2 cols wide, amber tint */}
          <motion.div
            className="sm:col-span-2 lg:col-start-2 rounded-xl border border-amber-200/60 bg-amber-50/60 p-6 cursor-default"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            whileHover={{ y: -4, boxShadow: amberCardHoverShadow }}
            style={{ boxShadow: amberCardShadow }}
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mb-5">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
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

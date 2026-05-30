"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Discover Ideas",
    description:
      "AI brainstorms and validates business ideas based on your skills, passions, and what the market actually wants.",
  },
  {
    number: "02",
    title: "Research the Market",
    description:
      "Analyze competitors, identify your target audience, and understand industry trends — instantly.",
  },
  {
    number: "03",
    title: "Build Your Plan",
    description:
      "Create a structured roadmap with milestones, financial projections, and the exact steps to take next.",
  },
  {
    number: "04",
    title: "Launch and Track",
    description:
      "Execute your plan, track milestones, and monitor what's working as your startup grows.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="hiw"
      className="relative min-h-[70svh] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 flex items-center"
    >
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-16 sm:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-950 max-w-lg leading-tight">
            One platform for your entire startup journey.
          </h2>
          <p className="mt-4 text-base text-neutral-500 max-w-sm">
            From first idea to first customer — AI guides every step.
          </p>
        </motion.div>

        {/* Desktop: horizontal timeline */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-0 relative">
          {/* Connecting line — drawn behind the circles */}
          <div
            className="absolute top-5 left-[calc(12.5%+4px)] right-[calc(12.5%+4px)] h-px bg-neutral-200"
            aria-hidden="true"
          />

          {STEPS.map((step, idx) => (
            <motion.div
              key={step.number}
              className="relative flex flex-col"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
            >
              {/* Number circle */}
              <div className="w-10 h-10 rounded-full border-2 border-amber-500 bg-background flex items-center justify-center mb-6 relative z-10">
                <span className="text-xs font-bold text-amber-600 tabular-nums">{step.number}</span>
              </div>

              <div className="pr-6">
                <h3 className="text-[0.95rem] font-semibold text-neutral-950 mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: vertical timeline */}
        <div className="sm:hidden">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.number}
              className="grid grid-cols-[40px_1fr] gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
            >
              {/* Left: circle + connector */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border-2 border-amber-500 bg-background flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-amber-600 tabular-nums">{step.number}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="w-px flex-1 bg-neutral-200 my-2" style={{ minHeight: 28 }} />
                )}
              </div>

              {/* Right: content */}
              <div className={idx < STEPS.length - 1 ? "pb-8" : ""}>
                <h3 className="text-base font-semibold text-neutral-950 mb-1.5 leading-snug">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

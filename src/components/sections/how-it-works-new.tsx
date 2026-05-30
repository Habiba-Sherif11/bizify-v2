"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Discover your idea.",
    description:
      "AI brainstorms and refines business ideas with you — grounded in your skills, your interests, and what the market actually wants right now.",
  },
  {
    number: "02",
    title: "Understand your market.",
    description:
      "Analyze competitors, identify your target audience, and map industry trends. Instant research that used to take days.",
  },
  {
    number: "03",
    title: "Build your plan.",
    description:
      "Get a structured roadmap: milestones, financial projections, and the exact next step — so you always know what to do.",
  },
  {
    number: "04",
    title: "Launch and grow.",
    description:
      "Execute your plan, track milestones, and see what's working as your startup finds its footing.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="hiw"
      className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
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

        {/* Steps */}
        <div className="space-y-12 sm:space-y-14">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.number}
              className="grid grid-cols-[56px_1fr] sm:grid-cols-[96px_1fr] gap-x-6 sm:gap-x-10 items-start"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: idx * 0.09, ease: "easeOut" }}
            >
              {/* Large amber number */}
              <span
                className="text-5xl sm:text-6xl font-bold text-amber-400 leading-none tabular-nums select-none pt-0.5"
                aria-hidden="true"
              >
                {step.number}
              </span>

              <div className="pt-1 sm:pt-2">
                <h3 className="text-lg sm:text-xl font-semibold text-neutral-950 leading-snug mb-2">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-500 leading-relaxed max-w-xl">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

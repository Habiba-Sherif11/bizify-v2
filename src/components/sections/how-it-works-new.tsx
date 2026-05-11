"use client";

// Internal components
import { ProcessCard } from "./process-card";

// Step data
const STEPS = [
  {
    id: 1,
    title: "Discover Ideas",
    description:
      "Use AI to brainstorm and validate business ideas based on your skills, passions, and market trends.",
  },
  {
    id: 2,
    title: "Research the Market",
    description:
      "Analyze competitors, identify target audiences, and understand industry trends instantly.",
  },
  {
    id: 3,
    title: "Build Your Plan",
    description:
      "Create a structured business roadmap with milestones, financial projections, and actionable steps.",
  },
  {
    id: 4,
    title: "Launch and Track",
    description:
      "Execute your plan, track milestones, and monitor KPIs to ensure your startup thrives.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="hiw"
      className="relative min-h-[80svh] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 flex items-center"
    >
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-block px-4 py-1.5 mb-6 bg-white border border-amber-500 rounded-full">
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
              How it works
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 mb-4">
            One Platform For Your Entire Startup Journey
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
            Bizify guides you from initial idea to a thriving business with AI at every step.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {STEPS.map((step) => (
            <ProcessCard key={step.id} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}
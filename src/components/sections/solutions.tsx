"use client";

// External libraries
import { Zap, BarChart3, Target, TrendingUp, Lightbulb, Rocket } from "lucide-react";

// Internal component (same file)
function SolutionCard({ icon: Icon, title, description, fadedColor, iconColor }: any) {
  return (
    <div className="flex justify-start items-end gap-4">
      {/* Colored Icon Box */}
      <div
        className={`w-10 h-10 ${fadedColor} rounded-lg flex items-center justify-center flex-shrink-0`}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      {/* Text Content */}
      <div className="flex flex-col justify-center items-start gap-1.5">
        <h3 className="text-neutral-950 text-sm font-semibold">{title}</h3>
        <p className="text-gray-500 text-xs font-normal leading-5">{description}</p>
      </div>
    </div>
  );
}

// Solution data
const SOLUTIONS = [
  {
    icon: Zap,
    title: "AI-Powered Research",
    description: "Instant market insights and competitor analysis powered by advanced AI",
    fadedColor: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: BarChart3,
    title: "All Tools in One",
    description: "Consolidate your workflow - no more juggling multiple platforms",
    fadedColor: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  {
    icon: Target,
    title: "Validate Fast",
    description: "Test your ideas with structured frameworks before investing",
    fadedColor: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: TrendingUp,
    title: "Expert Guidance",
    description: "Get personalized recommendations from AI mentors 24/7",
    fadedColor: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    icon: Lightbulb,
    title: "Smart Insights",
    description: "Get real-time recommendations tailored to your unique business needs",
    fadedColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
  {
    icon: Rocket,
    title: "Launch Ready",
    description: "Everything you need to go from idea to market in weeks, not months",
    fadedColor: "bg-green-50",
    iconColor: "text-green-600",
  },
];

export function Solutions() {
  return (
    <section id="features" className="relative py-16 px-4 sm:px-6 lg:px-8 flex items-center">
      <div className="relative w-full max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 mb-6 bg-white border border-amber-500 rounded-full">
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wide">Solutions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 mb-4">
            Every Problem Has a Solution
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
            Bizify solves the biggest challenges startup founders face.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {SOLUTIONS.map((solution, idx) => (
            <SolutionCard key={idx} {...solution} />
          ))}
        </div>
      </div>
    </section>
  );
}
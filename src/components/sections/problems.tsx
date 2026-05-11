"use client";

// External libraries
import { Card } from "@/components/ui/card";
import { BarChart3, Compass, FlaskConical, Users } from "lucide-react";

// Problem data
const PROBLEMS = [
  {
    icon: BarChart3,
    title: "Manual Market Research",
    description: "Hours spent digging through reports, surveys, and data that quickly becomes outdated.",
  },
  {
    icon: Compass,
    title: "Scattered Tools & Info",
    description: "Juggling spreadsheets, docs, and dozens of tabs just to piece together a plan.",
  },
  {
    icon: FlaskConical,
    title: "Hard to Validate Ideas",
    description: "No structured way to test whether your idea has real market potential before investing.",
  },
  {
    icon: Users,
    title: "No Expert Guidance",
    description: "Most first-time founders don’t have access to mentors or strategic advisors.",
  },
];

export function ProblemsSection() {
  return (
    <section
      id="problems"
      className="relative min-h-[88svh] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 flex items-center"
    >
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-block px-4 py-1.5 mb-6 bg-white border border-amber-500 rounded-full">
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
              The Problem
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 mb-4">
            Starting a Business Is Harder Than It Should Be
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 max-w-2xl mx-auto">
            Entrepreneurs waste time, money, and energy on fragmented processes that slow them down.
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {PROBLEMS.map((problem, idx) => (
            <Card
              key={idx}
              className="p-4 sm:p-5 border border-white/70 bg-white/60 backdrop-blur-md shadow-sm transition-colors duration-200 hover:bg-white/70"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-600/10 text-cyan-700 flex items-center justify-center">
                  <problem.icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-neutral-950 mb-1.5">{problem.title}</h3>
              <p className="text-neutral-600 text-xs leading-relaxed">{problem.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
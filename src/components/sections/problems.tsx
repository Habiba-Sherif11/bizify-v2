"use client";

import { motion } from "framer-motion";

const PROBLEMS = [
  {
    number: "01",
    title: "Manual Market Research",
    description:
      "Hours lost digging through reports that go stale before you finish reading them — and you haven't even started yet.",
  },
  {
    number: "02",
    title: "Scattered Tools, No Clear Direction",
    description:
      "Spreadsheets, docs, a dozen open tabs. Piecing together a plan takes longer than building the thing.",
  },
  {
    number: "03",
    title: "No Way to Know If Your Idea Works",
    description:
      "No structured way to test whether your idea has real potential before you invest your time, money, and confidence in it.",
  },
  {
    number: "04",
    title: "No One to Ask",
    description:
      "Most first-time founders have no access to mentors. The internet gives ten conflicting answers. You need one good one.",
  },
];

export function ProblemsSection() {
  return (
    <section id="problems" className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-950 max-w-lg leading-tight">
            Starting a business is harder than it should be.
          </h2>
          <p className="mt-4 text-base text-neutral-500 max-w-sm">
            Bizify gives you the structure, the research, and the guidance that used to cost a consultant's fee.
          </p>
        </motion.div>

        <div>
          {PROBLEMS.map((problem, idx) => (
            <motion.div
              key={problem.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
            >
              <div className="grid grid-cols-[48px_1fr] sm:grid-cols-[64px_1fr_1.4fr] gap-x-6 gap-y-1.5 sm:gap-y-0 py-7 border-t border-neutral-200/70 items-start">
                <span className="text-xl sm:text-2xl font-bold text-amber-500 leading-tight tabular-nums select-none pt-0.5">
                  {problem.number}
                </span>
                <h3 className="text-base sm:text-[1.05rem] font-semibold text-neutral-950 leading-snug sm:pt-0.5">
                  {problem.title}
                </h3>
                <p className="col-start-2 sm:col-start-3 text-sm sm:text-[0.9rem] text-neutral-500 leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </motion.div>
          ))}
          <div className="border-t border-neutral-200/70" />
        </div>
      </div>
    </section>
  );
}

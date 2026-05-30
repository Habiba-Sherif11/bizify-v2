"use client";

import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote:
      "I had the idea for two years. Bizify helped me turn it into an actual plan in one afternoon. I finally stopped second-guessing and started.",
    name: "Nour A.",
    context: "Business student, Cairo",
  },
  {
    quote:
      "The competitor research alone saved me weeks. I knew exactly who I was up against and where the gap was — before I spent a single pound.",
    name: "Karim M.",
    context: "First-time founder, Alexandria",
  },
  {
    quote:
      "I kept asking the AI and it kept answering — specifically, not generically. It felt like talking to someone who actually knew my idea.",
    name: "Salma R.",
    context: "Commerce graduate, Giza",
  },
];

export function SocialProof() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="w-full max-w-5xl mx-auto">
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-950 max-w-lg leading-tight">
            Founders who&apos;ve been where you are.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, idx) => (
            <motion.figure
              key={t.name}
              className="rounded-xl border border-neutral-200/80 bg-background p-6"
              style={{ boxShadow: "0 2px 8px -2px rgba(0,0,0,0.07), 0 0 1px rgba(0,0,0,0.05)" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
            >
              {/* Opening quote mark */}
              <span
                className="block text-4xl text-amber-300 leading-none mb-3 select-none"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <blockquote className="text-sm sm:text-[0.9rem] text-neutral-700 leading-relaxed mb-5">
                {t.quote}
              </blockquote>
              <figcaption>
                <p className="text-sm font-semibold text-neutral-950">{t.name}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{t.context}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

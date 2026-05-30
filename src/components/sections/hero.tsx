"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";
import mockBg from "@/assets/imgs/landing/mock-bg.png";
import { LiquidBlobBackground } from "@/components/hero/LiquidBlobBackground";

const HEADLINE = "From idea to launch with an AI co-founder by your side.";
const HEADLINE_WORDS = (() => {
  let offset = 0;
  return HEADLINE.split(" ").map((word) => {
    const start = offset;
    offset += word.length + 1;
    return { word, start };
  });
})();

export function Hero() {
  const { user, loading } = useAuth();
  const badgeControls   = useAnimation();
  const letterControls  = useAnimation();
  const subControls     = useAnimation();
  const ctaControls     = useAnimation();
  const mockupControls  = useAnimation();

  useEffect(() => {
    badgeControls.start({
      opacity: 1, y: 0,
      transition: { delay: 0.2, duration: 0.55, ease: "easeOut" },
    });

    letterControls.start((i) => ({
      opacity: 1, y: 0,
      transition: {
        delay: (i as number) * 0.04 + 0.55,
        duration: 0.65,
        ease: [0.2, 0.65, 0.3, 0.9] as [number, number, number, number],
      },
    }));

    subControls.start({
      opacity: 1, y: 0,
      transition: { delay: 1.6, duration: 0.7, ease: "easeOut" },
    });

    ctaControls.start({
      opacity: 1, y: 0,
      transition: { delay: 1.9, duration: 0.7, ease: "easeOut" },
    });

    mockupControls.start({
      opacity: 1, y: 0,
      transition: { delay: 2.1, duration: 1.0, ease: "easeOut" },
    });
  }, [badgeControls, letterControls, subControls, ctaControls, mockupControls]);

  return (
    <section className="hero relative z-1 w-full flex flex-col">
      <LiquidBlobBackground />

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 sm:px-6 lg:px-8 pt-32 pb-10">
        <div className="w-full max-w-5xl mx-auto text-center">

          {/* Trust badge
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={badgeControls}
            className="mb-8 flex justify-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-200 bg-amber-50/80 text-amber-700 text-sm font-medium backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
              Trusted by 2,400+ early-stage founders
            </span>
          </motion.div> */}

          {/* Letter-by-letter headline */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 leading-tight tracking-tight"
            aria-label={HEADLINE}
          >
            {HEADLINE_WORDS.map(({ word, start }, wi) => (
              <span key={wi} className="inline-block">
                {word.split("").map((char, ci) => (
                  <motion.span
                    key={ci}
                    custom={start + ci}
                    initial={{ opacity: 0, y: 40 }}
                    animate={letterControls}
                    style={{ display: "inline-block" }}
                  >
                    {char}
                  </motion.span>
                ))}
                {wi < HEADLINE_WORDS.length - 1 && (
                  <span style={{ display: "inline-block" }}>&nbsp;</span>
                )}
              </span>
            ))}
          </h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={subControls}
            className="mt-6 text-base sm:text-lg text-neutral-500 max-w-xl mx-auto leading-relaxed"
          >
            Bizify guides you from your first idea to your first customer — with AI that
            knows exactly where you&apos;re stuck and what to do next.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={ctaControls}
            className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
          >
            {!loading && user ? (
              <Button asChild variant="primary-gradient" size="lg" className="min-w-44 text-sm font-semibold px-6">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : !loading ? (
              <>
                <Button asChild variant="primary-gradient" size="lg" className="min-w-44 text-sm font-semibold px-6">
                  <Link href="/signup">Start building — it&apos;s free</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="min-w-44 text-neutral-600 hover:text-neutral-900 text-sm font-medium"
                >
                  <Link href="#hiw">See how it works</Link>
                </Button>
              </>
            ) : null}
          </motion.div>

          {/* Dashboard mockup — bottom 50px bleeds into next section */}
          <motion.div
            initial={{ opacity: 0, y: 56 }}
            animate={mockupControls}
            className="mt-12 w-full max-w-5xl mx-auto -mb-12.5"
          >
            <div
              className="relative w-full rounded-2xl overflow-hidden border border-neutral-200 shadow-xl shadow-neutral-200/60"
              style={{ aspectRatio: `${mockBg.width} / ${mockBg.height / 2}` }}
            >
              <Image
                src={mockBg}
                alt="Bizify dashboard — your startup workspace"
                width={mockBg.width}
                height={mockBg.height}
                className="w-full h-auto"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none bg-linear-to-t from-white to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/context/AuthContext";
import mockBg from "@/assets/imgs/landing/mock-bg.png";
import { LiquidBlobBackground } from "@/components/hero/LiquidBlobBackground";

const HEADLINE = "Your first business deserves more than a blank page.";
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
           Starting a business shouldn't feel like wandering in the dark. Bizify gives you the map, the tools, and the clarity to turn your "what if" into a "what's next."
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={ctaControls}
            className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
          >
            {!loading && user ? (
              <Button asChild variant="primary-gradient" size="lg" className="min-w-44 text-sm font-semibold px-6 rounded-4xl">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : !loading ? (
              <>
                <Button asChild variant="primary-gradient" size="lg" className="min-w-44 text-sm font-semibold px-6 rounded-4xl">
                  <Link href="/signup">Start Building Now </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="min-w-44 text-neutral-600 hover:text-neutral-900 text-sm font-medium rounded-4xl"
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

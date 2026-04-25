"use client";

// External libraries
import { Button } from "@/components/ui/button";

// Internal components
import HeroBg from "./herobg";
import { HeroMockup } from "./hero-mockup";

// Assets
import mockBg from "@/assets/imgs/landing/mock-bg.png";

export function Hero() {
  return (
    <section className=" hero relative isolate pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <HeroBg />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Text Content */}
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-bold text-neutral-900 leading-tight">
            From idea to launch <br className="hidden sm:inline" /> with an AI co-founder by your
            side.
          </h1>
          <p className="text-lg sm:text-xl text-neutral-600 font-light max-w-2xl mx-auto">
            Bizify is the first AI-powered platform that guides you through every step of building a
            startup
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
            <Button variant="primary-gradient" size="lg" className="min-w-44">
              Get started now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="min-w-44 border-cyan-600 text-cyan-600 hover:bg-cyan-50"
            >
              Start free trial
            </Button>
          </div>
        </div>

        {/* Hero Mockup */}
        <div className="mt-12">
          <HeroMockup imageSrc={mockBg} imageAlt="Bizify Dashboard" />
        </div>
      </div>
    </section>
  );
}
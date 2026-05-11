"use client";

// External libraries
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Internal components
import HeroBg from "./herobg";
import { HeroMockup } from "./hero-mockup";
import { useAuth } from "@/features/auth/context/AuthContext";

// Assets
import mockBg from "@/assets/imgs/landing/mock-bg.png";

export function Hero() {
  const { user, loading } = useAuth();

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
          <p className="text-base sm:text-lg text-neutral-600 font-light max-w-2xl mx-auto">
            Bizify is the first AI-powered platform that guides you through every step of building a
            startup
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
            {!loading && user ? (
              <Button asChild variant="primary-gradient" size="lg" className="min-w-44">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : !loading ? (
              <>
                <Button asChild variant="primary-gradient" size="lg" className="min-w-44">
                  <Link href="/signup">Get started now</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="min-w-44 border-cyan-600 text-cyan-600 hover:bg-cyan-50"
                >
                  <Link href="/login">Start free trial</Link>
                </Button>
              </>
            ) : null}
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

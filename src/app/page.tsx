// External libraries
import Image from "next/image";

// Internal components
import { Navbar } from "@/components/sections/navbar";
import { Hero } from "@/components/sections/hero";
import { ProblemsSection } from "@/components/sections/problems";
import { Solutions } from "@/components/sections/solutions";
import { HowItWorks } from "@/components/sections/how-it-works-new";
import { SocialProof } from "@/components/sections/social-proof";
import { AiStartupMentorSection } from "@/components/sections/ai-startup-mentor";
import { PricingSection } from "@/components/sections/pricing";
import { Footer } from "@/components/sections/footer";

// Assets
import section2Bg from "@/assets/imgs/landing/section2.png";
import section33Bg from "@/assets/imgs/landing/section33.png";

export default function Home() {
  return (
    <div className="flex flex-col bg-background">
      <Navbar />

      <main>
        {/* Hero */}
        <Hero />

        {/* Problems + Solutions (with background) */}
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <Image
              src={section2Bg}
              alt="Bizify platform background"
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-white/72" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-white" />
          </div>

          <ProblemsSection />
          <Solutions />
        </section>

        {/* How It Works (with background) */}
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <Image
              src={section33Bg}
              alt="How it works background"
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
          <HowItWorks />
        </section>

        {/* Social Proof */}
        <SocialProof />

        {/* AI Mentor CTA */}
        <AiStartupMentorSection />

        {/* Pricing */}
        <PricingSection />
      </main>

      <Footer />
    </div>
  );
}

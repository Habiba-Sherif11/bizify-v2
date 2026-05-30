import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AiStartupMentorSection() {
  return (
    <section className="px-4 pt-8 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl rounded-2xl bg-amber-50 border border-amber-200/60 p-8 sm:p-10 lg:p-12"
        style={{ boxShadow: "0 2px 24px -4px rgba(245,158,11,0.12), 0 0 1px rgba(245,158,11,0.08)" }}
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
              AI Co-Founder
            </p>
            <h3 className="text-neutral-950 text-2xl sm:text-3xl font-bold leading-tight">
              Your co-founder, available 24/7.
            </h3>
            <p className="text-neutral-600 text-base leading-relaxed max-w-lg">
              Expert guidance whenever you need it — without the six-figure advisor fees.
              Bizify analyzes your market, validates your ideas, and gives you a step-by-step
              action plan built around your vision.
            </p>
          </div>

          <Button
            asChild
            variant="default"
            size="lg"
            className="w-full sm:w-auto shrink-0 bg-neutral-950 text-white hover:bg-neutral-800 min-w-44 font-semibold px-6"
          >
            <Link href="/signup">Try it free</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

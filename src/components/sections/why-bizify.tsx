import { Button } from "@/components/ui/button";

export function WhyBizifySection() {
  return (
    <section className="px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-amber-500/10 bg-linear-to-r from-amber-500/5 to-yellow-500/5 p-6 sm:p-7 lg:px-8 lg:pt-8 lg:pb-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <h3 className="text-neutral-950 text-xl sm:text-2xl font-semibold leading-tight">
              Stop Wondering. Start Building.
            </h3>
            <p className="text-gray-500 text-sm leading-6">
              Bizify eliminates the guesswork from startup decisions. Get validated insights, expert
              guidance, and actionable strategies—all in one platform. Transform your idea into a
              market-ready business in weeks, not months.
            </p>
          </div>

          <Button type="button" variant="secondary-gradient" size="lg" className="w-full sm:w-52">
            Start free today
          </Button>
        </div>
      </div>
    </section>
  );
}
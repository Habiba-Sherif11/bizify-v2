import { Button } from "@/components/ui/button";

export function AiStartupMentorSection() {
  return (
    <section className="px-4 pt-16 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-amber-500/10 bg-gradient-to-r from-amber-500/5 to-yellow-500/5 p-6 sm:p-7 lg:px-10 lg:pt-10 lg:pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <h3 className="text-neutral-950 text-xl sm:text-2xl font-semibold leading-tight">
              Your 24/7 AI Co-Founder
            </h3>
            <p className="text-gray-500 text-base leading-6">
              Get expert guidance whenever you need it. Bizify analyzes markets, validates your ideas,
              and creates step-by-step action plans tailored to your vision—without the six-figure
              advisor fees.
            </p>
          </div>

          <Button type="button" variant="primary-gradient" size="lg" className="w-full sm:w-52">
            Try for free
          </Button>
        </div>
      </div>
    </section>
  );
}
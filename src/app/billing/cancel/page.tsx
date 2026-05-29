"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center px-4">
      <div className="text-center max-w-sm space-y-5">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto">
          <XCircle size={32} className="text-neutral-400 dark:text-neutral-500" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            Payment cancelled
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            You cancelled the payment. No charge was made. You can try again whenever you&apos;re ready.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => router.push("/entrepreneur/upgrade-plan")}
            className="bg-amber-500 hover:bg-amber-600 text-white border-0"
          >
            View plans
          </Button>
          <Button
            onClick={() => router.push("/entrepreneur")}
            variant="outline"
            className="border-neutral-300 dark:border-neutral-700"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

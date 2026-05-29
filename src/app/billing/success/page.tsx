import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import BillingSuccessClient from "./BillingSuccessClient";

export default function BillingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
          <Loader2 size={48} className="animate-spin text-amber-500" />
        </div>
      }
    >
      <BillingSuccessClient />
    </Suspense>
  );
}

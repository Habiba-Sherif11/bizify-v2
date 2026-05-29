"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/features/auth/lib/api";

type State = "capturing" | "success" | "error";

export default function BillingSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<State>("capturing");
  const [errorMsg, setErrorMsg] = useState("");
  const didCapture = useRef(false);

  useEffect(() => {
    if (didCapture.current) return;
    didCapture.current = true;

    const token = searchParams.get("token"); // PayPal order ID
    const planId = sessionStorage.getItem("paypal_plan_id");

    if (!token || !planId) {
      setErrorMsg("Missing payment information. Please try again.");
      setState("error");
      return;
    }

    api
      .post("/billing/paypal/capture", { order_id: token, plan_id: planId })
      .then(() => {
        sessionStorage.removeItem("paypal_plan_id");
        sessionStorage.removeItem("paypal_plan_name");
        setState("success");
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Payment capture failed. Please contact support.";
        setErrorMsg(msg);
        setState("error");
      });
  }, [searchParams]);

  if (state === "capturing") {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="animate-spin text-amber-500 mx-auto" />
          <p className="text-neutral-600 dark:text-neutral-300 font-medium">
            Confirming your payment…
          </p>
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            Please don&apos;t close this page.
          </p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center px-4">
        <div className="text-center max-w-sm space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto">
            <XCircle size={32} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              Payment failed
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{errorMsg}</p>
          </div>
          <Button
            onClick={() => router.push("/entrepreneur/upgrade-plan")}
            variant="outline"
            className="border-neutral-300 dark:border-neutral-700"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center px-4">
      <div className="text-center max-w-sm space-y-5">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            Payment successful!
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Your subscription has been activated. You now have access to all features in your plan.
          </p>
        </div>
        <Button
          onClick={() => router.push("/entrepreneur")}
          className="bg-amber-500 hover:bg-amber-600 text-white border-0"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

"use client";
import { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export function SuccessStep() {
  const { user } = useAuth();
  const router = useRouter();

  // Auto‑redirect after 4 seconds as a safety net
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        router.push(`/${user.role}`);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  const goToDashboard = () => {
    if (user) {
      router.push(`/${user.role}`);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="text-center space-y-6">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
      <h2 className="text-2xl font-semibold font-[var(--font-cormorant-sc)]">
        You're all set!
      </h2>
      <p className="text-neutral-600">
        Your account has been created successfully.
      </p>

      {/* Primary action button */}
      <button
        onClick={goToDashboard}
        className="inline-flex items-center justify-center rounded-lg bg-amber-500 text-white px-6 py-2.5 text-sm font-medium hover:bg-amber-600 transition shadow-sm"
      >
        Go to Dashboard
      </button>

      <p className="text-xs text-neutral-400">
        You will be redirected automatically in a few seconds...
      </p>
    </div>
  );
}
"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";

const roleRoutes: Record<string, string> = {
  entrepreneur: "/entrepreneur",
  manufacturer: "/manufacturer",
  mentor: "/mentor",
  supplier: "/supplier",
  admin: "/admin",
};

export function SuccessStep() {
  const { user } = useAuth();
  const router = useRouter();

  const destination = user?.role ? (roleRoutes[user.role] ?? "/") : "/";

  useEffect(() => {
    const timer = setTimeout(() => router.push(destination), 4000);
    return () => clearTimeout(timer);
  }, [destination, router]);

  return (
    <div className="flex flex-col items-center text-center space-y-5 py-6">
      <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
        <CheckCircle2 className="w-6 h-6 text-green-500" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900">You&apos;re all set!</h2>
        <p className="text-sm text-gray-500">
          Your account has been created successfully.
        </p>
      </div>

      <Button
        variant="primary-gradient"
        size="lg"
        className="w-full max-w-xs"
        onClick={() => router.push(destination)}
      >
        Go to dashboard
      </Button>

      <p className="text-xs text-gray-400">
        Redirecting automatically in a few seconds…
      </p>
    </div>
  );
}

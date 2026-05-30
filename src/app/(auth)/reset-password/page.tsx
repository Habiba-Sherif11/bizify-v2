import Link from "next/link";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import SVGComponent from "@/components/sections/logo";

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-cyan-500 animate-spin" />
      <p className="text-sm text-[#8C8C8C]">Loading…</p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <SVGComponent className="h-7 w-auto" />
            <span
              className="text-[1.75rem] font-semibold leading-none text-[#1C1C1E]"
              style={{ fontFamily: "var(--font-cormorant-sc)" }}
            >
              Bizify
            </span>
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-[#FAFAFA] p-6 shadow-sm">
          <Suspense fallback={<LoadingFallback />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

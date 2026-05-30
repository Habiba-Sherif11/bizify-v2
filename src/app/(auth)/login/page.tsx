import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import SVGComponent from "@/components/sections/logo";
import { LoginBlobBackground } from "@/components/auth/LoginBlobBackground";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen">
      {/* Full-page blob background */}
      <div className="absolute inset-0 z-0 overflow-hidden select-none">
        <LoginBlobBackground />
      </div>

      {/* Left — form */}
      <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-sm space-y-6">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <SVGComponent className="h-7 w-auto" />
            <span
              className="text-lg font-semibold text-[#1C1C1E]"
              style={{ fontFamily: "var(--font-cormorant-sc)" }}
            >
              Bizify
            </span>
          </Link>

          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-[#1C1C1E]">Welcome back</h1>
          </div>

          <div className="rounded-xl border border-gray-200/80 bg-[#FAFAFA] p-6 shadow-sm">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Right — empty column to preserve layout */}
      <div className="hidden lg:block lg:w-1/2" />
    </div>
  );
}

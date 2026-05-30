import Link from "next/link";
import { Suspense } from "react";
import { SignupForm } from "@/features/auth/components/SignupForm";
import SVGComponent from "@/components/sections/logo";
import { LoginBlobBackground } from "@/components/auth/LoginBlobBackground";

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div className="absolute inset-0 z-0 overflow-hidden select-none">
        <LoginBlobBackground />
      </div>

      <div className="relative z-10 w-full flex items-center justify-center px-4 py-6 sm:px-8">
        <div className="w-full max-w-xl">
          <div className="rounded-2xl ring-1 ring-black/[0.07] bg-white/90 backdrop-blur-md shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12),0_0_1px_rgba(0,0,0,0.06)] overflow-hidden">

            {/* Brand header */}
            <div className="px-7 pt-5 pb-4 flex items-center justify-between border-b border-black/[0.05]">
              <Link href="/" className="inline-flex items-center gap-1.5">
                <SVGComponent className="h-7 w-auto" />
                <span
                  className="text-[1.25rem] leading-none tracking-[0.02em] text-[#1C1C1E]"
                  style={{ fontFamily: "var(--font-cormorant-sc)", fontWeight: 400 }}
                >
                  Bizify
                </span>
              </Link>
              <h1 className="text-sm font-semibold text-[#1C1C1E] tracking-tight">
                Create your account
              </h1>
            </div>

            {/* Multi-step form */}
            <div className="px-7 py-5">
              <Suspense>
                <SignupForm />
              </Suspense>
            </div>

            {/* Footer */}
            <div className="px-7 py-3 border-t border-black/[0.05] bg-black/[0.015] text-center">
              <p className="text-xs text-[#8C8C8C]">
                Already have an account?{" "}
                <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

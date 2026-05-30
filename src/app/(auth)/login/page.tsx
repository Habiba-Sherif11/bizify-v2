import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import SVGComponent from "@/components/sections/logo";
import { LoginBlobBackground } from "@/components/auth/LoginBlobBackground";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <div className="absolute inset-0 z-0 overflow-hidden select-none">
        <LoginBlobBackground />
      </div>

      <div className="relative z-10 w-full flex items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl ring-1 ring-black/[0.07] bg-white/90 backdrop-blur-md p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12),0_0_1px_rgba(0,0,0,0.06)] space-y-6">

            {/* Brand + Welcome */}
            <div className="text-center space-y-3">
              <Link href="/" className="inline-flex items-center gap-1.5">
                <SVGComponent className="h-6 w-auto" />
                <span
                  className="text-[1.5rem] leading-none tracking-[0.02em] text-[#1C1C1E]"
                  style={{ fontFamily: "var(--font-cormorant-sc)", fontWeight: 400 }}
                >
                  Bizify
                </span>
              </Link>
              <div className="space-y-0.5">
                <h1 className="text-lg font-semibold text-[#1C1C1E] tracking-tight">
                  Welcome back
                </h1>
                <p className="text-sm text-[#8C8C8C]">
                  Your workspace is ready.
                </p>
              </div>
            </div>

            {/* Form */}
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

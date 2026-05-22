import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import SVGComponent from "@/components/sections/logo";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <SVGComponent className="h-7 w-auto" />
            <span
              className="text-lg font-semibold text-[#1C1C1E]"
              style={{ fontFamily: "var(--font-cormorant-sc)" }}
            >
              Bizify
            </span>
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-[#FAFAFA] p-6 shadow-sm">
          <ForgotPasswordForm />
        </div>

        <p className="text-center text-sm">
          <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-medium">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

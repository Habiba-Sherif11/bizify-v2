import Link from "next/link";
import { SignupForm } from "@/features/auth/components/SignupForm";
import SVGComponent from "@/components/sections/logo";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg space-y-4">
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

        <div>
          <h1 className="text-xl font-bold text-[#1C1C1E]">Create your account</h1>
          <p className="text-sm text-[#8C8C8C] mt-1">Turn your idea into a plan.</p>
        </div>

        <SignupForm />

        <p className="text-center text-xs text-[#8C8C8C]">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

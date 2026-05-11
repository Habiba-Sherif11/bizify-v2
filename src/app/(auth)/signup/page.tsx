import Link from "next/link";
import { SignupForm } from "@/features/auth/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Create your Bizify account</h1>
          <p className="text-sm text-gray-500 mt-1">Join the platform built for business growth</p>
        </div>

        <SignupForm />

        <p className="text-center text-xs text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

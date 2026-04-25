import { SignupForm } from "@/features/auth/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  );
}
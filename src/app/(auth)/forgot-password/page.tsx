import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
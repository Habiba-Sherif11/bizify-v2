import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

function ResetPasswordContent() {
  return <ResetPasswordForm />;
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<LoadingFallback />}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotSchema } from "@/features/auth/lib/validations";
import { Button } from "@/components/ui/button";
import { api } from "../lib/api";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const emailValue = watch("email");

  const onSubmit = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      console.log("📝 [Forgot Password] Requesting OTP for:", data.email);

      const response = await api.post("/auth/forgot-password", data);
      console.log("✅ [Forgot Password] OTP sent successfully:", response.data);

      toast.success("OTP sent to your email");

      // Redirect to reset password with email in URL params
      // This preserves state across page navigation
      const encodedEmail = encodeURIComponent(data.email);
      console.log("🔄 [Forgot Password] Redirecting to reset-password with email...");
      router.push(`/reset-password?email=${encodedEmail}&step=otp`);
    } catch (error: any) {
      console.error("❌ [Forgot Password] Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to send OTP";

      console.error("📨 Error:", errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h2 className="text-2xl font-semibold font-[var(--font-cormorant-sc)]">Forgot Password</h2>
      <p className="text-sm text-neutral-600">Enter your email to receive a reset code</p>

      <div>
        <input
          {...register("email")}
          type="email"
          placeholder="Enter your email"
          className="w-full rounded-lg border border-neutral-300 p-2.5"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary-gradient"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send OTP"}
      </Button>
    </form>
  );
}
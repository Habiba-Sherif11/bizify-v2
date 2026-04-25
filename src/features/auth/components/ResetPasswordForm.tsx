"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetSchema } from "../lib/validations";
import { Button } from "@/components/ui/button";
import { api } from "../lib/api";
import { toast } from "react-toastify";
import { useSearchParams, useRouter } from "next/navigation";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailFromUrl = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: emailFromUrl,
      otp_code: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: {
    email: string;
    otp_code: string;
    new_password: string;
    confirm_password: string;
  }) => {
    try {
      // Send as JSON to our proxy – the proxy handles the conversion to query params
      const response = await api.post("/auth/reset-password", {
        email: data.email,
        otp_code: data.otp_code,
        new_password: data.new_password,
      });

      console.log("✅ Proxy response:", response.data);
      toast.success("Password reset successfully! Redirecting to login...");
      router.push("/login");
    } catch (error: any) {
      console.error("❌ Reset error:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "Reset failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h2 className="text-2xl font-semibold font-[var(--font-cormorant-sc)]">
        Reset Password
      </h2>

      {/* Email (read-only, pre-filled from URL) */}
      <div>
        <label className="block text-sm font-medium text-neutral-700">Email</label>
        <input
          {...register("email")}
          type="email"
          readOnly
          className="mt-1 w-full rounded-lg border border-neutral-300 bg-gray-50 px-4 py-2.5 text-sm"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      {/* OTP Code */}
      <div>
        <label className="block text-sm font-medium text-neutral-700">OTP Code</label>
        <input
          {...register("otp_code")}
          className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm"
          placeholder="Enter 6‑digit code"
        />
        {errors.otp_code && (
          <p className="text-red-500 text-xs mt-1">{errors.otp_code.message}</p>
        )}
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-medium text-neutral-700">New Password</label>
        <input
          {...register("new_password")}
          type="password"
          className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm"
        />
        {errors.new_password && (
          <p className="text-red-500 text-xs mt-1">{errors.new_password.message}</p>
        )}
      </div>

      {/* Confirm New Password */}
      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Confirm New Password
        </label>
        <input
          {...register("confirm_password")}
          type="password"
          className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm"
        />
        {errors.confirm_password && (
          <p className="text-red-500 text-xs mt-1">
            {errors.confirm_password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary-gradient"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
}
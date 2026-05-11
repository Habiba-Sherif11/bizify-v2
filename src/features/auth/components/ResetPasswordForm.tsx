"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { useSearchParams, useRouter } from "next/navigation";
import { resetSchema } from "../lib/validations";
import { Button } from "@/components/ui/button";
import { api } from "../lib/api";

const RESEND_COOLDOWN = 60;

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailFromUrl = searchParams.get("email") || "";

  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

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

  // Countdown tick
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const handleResend = async () => {
    if (isResending || countdown > 0 || !emailFromUrl) return;
    setIsResending(true);
    try {
      await api.post("/auth/forgot-password", { email: emailFromUrl });
      toast.success("A new reset code has been sent to your email");
      setCountdown(RESEND_COOLDOWN);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || "Failed to resend. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: {
    email: string;
    otp_code: string;
    new_password: string;
    confirm_password: string;
  }) => {
    try {
      await api.post("/auth/reset-password", {
        email: data.email,
        otp_code: data.otp_code,
        new_password: data.new_password,
      });
      toast.success("Password reset successfully! Redirecting to login…");
      router.push("/login");
    } catch (error: unknown) {
      const e = error as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || "Reset failed. Please try again.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center mb-1">
          <Mail className="w-5 h-5 text-cyan-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
        <p className="text-sm text-neutral-500">
          Enter the code sent to{" "}
          <span className="font-medium text-gray-700">{emailFromUrl}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Hidden email field (keeps validation happy) */}
        <input {...register("email")} type="hidden" />

        {/* OTP Code */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Reset Code
          </label>
          <input
            {...register("otp_code")}
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit code"
            className="w-full text-center text-xl tracking-[0.5em] font-mono rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 transition-colors"
          />
          {errors.otp_code && (
            <p className="text-red-500 text-xs mt-1">{errors.otp_code.message}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            New Password
          </label>
          <input
            {...register("new_password")}
            type="password"
            placeholder="Enter new password"
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 transition-colors"
          />
          {errors.new_password && (
            <p className="text-red-500 text-xs mt-1">{errors.new_password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Confirm New Password
          </label>
          <input
            {...register("confirm_password")}
            type="password"
            placeholder="Confirm new password"
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 transition-colors"
          />
          {errors.confirm_password && (
            <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary-gradient"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Resetting…
            </span>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>

      {/* Resend */}
      <p className="text-center text-xs text-gray-400">
        Didn&apos;t get the code?{" "}
        {countdown > 0 ? (
          <span className="text-gray-500 tabular-nums">Resend in {countdown}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-cyan-600 font-medium disabled:opacity-50 cursor-pointer"
          >
            {isResending ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 size={11} className="animate-spin" />
                Sending…
              </span>
            ) : (
              "Resend"
            )}
          </button>
        )}
      </p>
    </div>
  );
}

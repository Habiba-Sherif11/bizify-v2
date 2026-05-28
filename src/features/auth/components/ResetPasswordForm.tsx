"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { resetSchema } from "../lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      toast.success("Password reset successfully! Redirecting to sign in…");
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
        <h2 className="text-lg font-semibold text-[#1C1C1E]">Reset your password</h2>
        <p className="text-sm text-[#8C8C8C]">
          Enter the code sent to{" "}
          <span className="font-medium text-[#1C1C1E]">{emailFromUrl}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Hidden email field */}
        <input {...register("email")} type="hidden" />

        {/* Reset code */}
        <div className="space-y-1.5">
          <Label htmlFor="otp_code">Reset code</Label>
          <Input
            {...register("otp_code")}
            id="otp_code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            className="h-auto py-3 text-center text-xl tracking-[0.5em] font-mono"
          />
          {errors.otp_code && (
            <p className="text-red-500 text-xs">{errors.otp_code.message}</p>
          )}
        </div>

        {/* New password */}
        <div className="space-y-1.5">
          <Label htmlFor="new_password">New password</Label>
          <Input
            {...register("new_password")}
            id="new_password"
            type="password"
            placeholder="Enter new password"
          />
          {errors.new_password && (
            <p className="text-red-500 text-xs">{errors.new_password.message}</p>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirm_password">Confirm new password</Label>
          <Input
            {...register("confirm_password")}
            id="confirm_password"
            type="password"
            placeholder="Confirm new password"
          />
          {errors.confirm_password && (
            <p className="text-red-500 text-xs">{errors.confirm_password.message}</p>
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
            "Reset password"
          )}
        </Button>
      </form>

      {/* Resend */}
      <p className="text-center text-xs text-[#8C8C8C]">
        Didn&apos;t get the code?{" "}
        {countdown > 0 ? (
          <span className="text-[#8C8C8C] tabular-nums">Resend in {countdown}s</span>
        ) : (
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={handleResend}
            disabled={isResending}
            className="text-cyan-600 font-medium h-auto p-0"
          >
            {isResending ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 size={11} className="animate-spin" />
                Sending…
              </span>
            ) : (
              "Resend"
            )}
          </Button>
        )}
      </p>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { api } from "../lib/api";

interface Props {
  onVerify: (otp: string) => Promise<void>;
  email: string;
}

const RESEND_COOLDOWN = 60;

export function OTPVerification({ onVerify, email }: Props) {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await onVerify(otp);
    } catch {
      // Error handled by parent via toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (isResending || countdown > 0) return;
    setIsResending(true);
    try {
      await api.post("/auth/resend-verification-otp", { email });
      toast.success("A new code has been sent to your email");
      setOtp("");
      setError("");
      setCountdown(RESEND_COOLDOWN);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || "Failed to resend. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-2 pt-2">
        <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center mb-1">
          <Mail className="w-5 h-5 text-cyan-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Check your email</h2>
        <p className="text-sm text-gray-500">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>

      {/* OTP form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setOtp(val);
              if (error) setError("");
            }}
            placeholder="000000"
            disabled={isSubmitting}
            className="w-full text-center text-2xl tracking-[0.6em] font-mono rounded-lg border border-gray-300 bg-white px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 disabled:opacity-50 transition-colors"
          />
          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary-gradient"
          size="lg"
          className="w-full"
          disabled={isSubmitting || otp.length !== 6}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying…
            </span>
          ) : (
            "Verify email"
          )}
        </Button>
      </form>

      {/* Resend section */}
      <p className="text-center text-xs text-gray-400">
        Didn&apos;t get the code?{" "}
        {countdown > 0 ? (
          <span className="text-gray-500 tabular-nums">
            Resend in {countdown}s
          </span>
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

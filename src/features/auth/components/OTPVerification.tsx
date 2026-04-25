"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpSchema } from "@/features/auth/lib/validations";
import { Button } from "@/components/ui/button";

interface Props {
  onVerify: (otp: string) => Promise<void>;
  email: string;
}

export function OTPVerification({ onVerify, email }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(otpSchema) });

  const handleOTPSubmit = async (data: any) => {
    try {
      await onVerify(data.otp_code);
    } catch (error) {
      // Error is handled by parent component via toast
    }
  };

  return (
    <form onSubmit={handleSubmit(handleOTPSubmit)} className="space-y-5">
      <h2 className="text-2xl font-semibold font-[var(--font-cormorant-sc)]">
        Verify Your Email
      </h2>
      <p className="text-sm text-neutral-600">
        Enter the 6‑digit code sent to <span className="font-medium">{email}</span>
      </p>

      <input
        {...register("otp_code")}
        maxLength={6}
        className="w-full text-center text-2xl tracking-[0.5em] rounded-lg border border-neutral-300 bg-white p-3"
        placeholder="000000"
        disabled={isSubmitting}
      />
      {errors.otp_code && (
        <p className="text-red-500 text-xs">{errors.otp_code.message as string}</p>
      )}

      <Button
        type="submit"
        variant="primary-gradient"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Verifying..." : "Verify"}
      </Button>
    </form>
  );
}
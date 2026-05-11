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
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", data);
      toast.success("OTP sent to your email");
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      const e = error as { response?: { data?: { error?: string; detail?: string } }; message?: string };
      const errorMsg =
        e.response?.data?.error ||
        e.response?.data?.detail ||
        e.message ||
        "Failed to send OTP";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h2 className="text-xl font-semibold">Forgot Password</h2>
      <p className="text-sm text-neutral-600">Enter your email to receive a reset code</p>

      <div>
        <input
          {...register("email")}
          type="email"
          placeholder="Enter your email"
          className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 disabled:opacity-50 transition-colors"
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
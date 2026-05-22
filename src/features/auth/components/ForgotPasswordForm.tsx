"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotSchema } from "@/features/auth/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      toast.success("Reset code sent to your email");
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      const e = error as { response?: { data?: { error?: string; detail?: string } }; message?: string };
      const errorMsg =
        e.response?.data?.error ||
        e.response?.data?.detail ||
        e.message ||
        "Failed to send reset code";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[#1C1C1E]">Forgot your password?</h2>
        <p className="text-sm text-[#8C8C8C] mt-1">
          Enter your email and we'll send you a reset code.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="forgot-email">Email</Label>
        <Input
          {...register("email")}
          id="forgot-email"
          type="email"
          placeholder="you@example.com"
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
        {isLoading ? "Sending…" : "Send reset code"}
      </Button>
    </form>
  );
}

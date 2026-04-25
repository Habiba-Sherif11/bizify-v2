"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/features/auth/lib/validations";
import { Button } from "@/components/ui/button";
import { useLogin } from "../hooks/useLogin";
import Link from "next/link";

export function LoginForm() {
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const isLoading = loginMutation.isPending || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit((data) => loginMutation.mutate(data))}
      className="space-y-5"
    >
      <h2 className="text-2xl font-semibold font-[var(--font-cormorant-sc)]">
        Welcome Back
      </h2>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Email</label>
        <input
          {...register("email")}
          type="email"
          className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">Password</label>
        <input
          {...register("password")}
          type="password"
          className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm"
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary-gradient"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </Button>

      <div className="text-center">
        <Link
          href="/forgot-password"
          className="text-sm text-cyan-600 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <div className="text-center">
        <span className="text-sm text-neutral-600">
          Don't have an account?{" "}
          <Link href="/signup" className="text-cyan-600 hover:underline">
            Sign up
          </Link>
        </span>
      </div>
    </form>
  );
}
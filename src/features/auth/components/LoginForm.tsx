"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { GoogleButton } from "./GoogleButton";

const GOOGLE_ERRORS: Record<string, string> = {
  google_unavailable: "Google sign-in is currently unavailable. Please try again.",
  google_failed: "Google sign-in failed. Please try again.",
  google_no_code: "Google sign-in was cancelled.",
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const searchParams = useSearchParams();
  const googleError = GOOGLE_ERRORS[searchParams.get("error") ?? ""] ?? null;

  const { mutate: login, isPending, error, reset } = useLogin();

  const emailValid = isValidEmail(email);
  const isEmailError = emailTouched && email.length > 0 && !emailValid;
  const isEmailSuccess = emailTouched && emailValid;
  const isPasswordError = passwordTouched && password.length === 0;
  const isFormReady = emailValid && password.length > 0;

  const errorMessage =
    (error as { response?: { data?: { error?: string } } } | null)
      ?.response?.data?.error ?? "Invalid credentials. Please try again.";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    if (!isFormReady) return;
    login({ email: email.trim().toLowerCase(), password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Google error */}
      {googleError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
          <p className="text-sm text-red-700">{googleError}</p>
        </div>
      )}

      

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (error) reset(); }}
          onBlur={() => { if (email.length > 0) setEmailTouched(true); }}
          disabled={isPending}
          className={cn(
            isEmailError && "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/20",
            isEmailSuccess && "border-cyan-500 focus-visible:border-cyan-500",
          )}
        />
        {isEmailError && (
          <p className="text-xs text-red-500">Please enter a valid email address</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-xs text-cyan-600 hover:text-cyan-700 font-medium">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (error) reset(); }}
            onBlur={() => setPasswordTouched(true)}
            disabled={isPending}
            className={cn(
              "pr-10",
              isPasswordError && "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/20",
              !isPasswordError && passwordTouched && password.length > 0 && "border-cyan-500",
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {isPasswordError && (
          <p className="text-xs text-red-500">Password is required</p>
        )}
      </div>

      {/* Inline API error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      <Button
        type="submit"
        variant="primary-gradient"
        size="lg"
        className="w-full"
        disabled={isPending || !isFormReady}
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in…
          </span>
        ) : (
          "Sign in"
        )}
      </Button>

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or sign in with email</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Google sign-in */}
      <GoogleButton label="Sign in with Google" />

      

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-cyan-600 hover:text-cyan-700 font-medium">
          Sign up for free
        </Link>
      </p>
    </form>
  );
}

"use client";

import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
  visible: boolean;
}

const CHECKS = [
  { label: "8 or more characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

export function PasswordStrength({ password, visible }: PasswordStrengthProps) {
  if (!visible || password.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 pt-1">
      {CHECKS.map((check) => {
        const met = check.test(password);
        return (
          <div key={check.label} className="flex items-center gap-2">
            <div
              className={cn(
                "w-3 h-3 rounded-full shrink-0 transition-colors",
                met ? "bg-cyan-500" : "bg-gray-200"
              )}
            />
            <span
              className={cn(
                "text-xs transition-colors",
                met ? "text-cyan-600" : "text-gray-400"
              )}
            >
              {check.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

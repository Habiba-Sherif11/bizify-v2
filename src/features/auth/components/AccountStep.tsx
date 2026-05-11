"use client";

import { useState } from "react";
import { Eye, EyeOff, Rocket, UserCheck, Factory, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrength } from "./PasswordStrength";
import { cn } from "@/lib/utils";
import { GoogleButton } from "./GoogleButton";

export type Role = "entrepreneur" | "manufacturer" | "mentor" | "supplier";

interface Props {
  onNext: (
    data: {
      role: Role;
      full_name: string;
      email: string;
      password: string;
      confirm_password: string;
      company_name?: string;
      description?: string;
      services?: string;
      experience?: string;
      files?: File[];
    },
    role: Role
  ) => void;
}

const ROLE_CARDS = [
  {
    role: "entrepreneur" as Role,
    icon: Rocket,
    title: "Entrepreneur",
    subtitle: "I'm building a business — from idea to launch.",
  },
  {
    role: "mentor" as Role,
    icon: UserCheck,
    title: "Mentor",
    subtitle: "I guide founders and share my expertise.",
  },
  {
    role: "manufacturer" as Role,
    icon: Factory,
    title: "Manufacturer",
    subtitle: "I produce goods and manage production.",
  },
  {
    role: "supplier" as Role,
    icon: Package,
    title: "Supplier",
    subtitle: "I provide materials and products.",
  },
] as const;

const PASSWORD_CHECKS = [
  (p: string) => p.length >= 8,
  (p: string) => /[A-Z]/.test(p),
  (p: string) => /[a-z]/.test(p),
  (p: string) => /[0-9]/.test(p),
];

function isPasswordValid(p: string) {
  return PASSWORD_CHECKS.every((fn) => fn(p));
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function AccountStep({ onNext }: Props) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Shared fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Partner-only fields
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  // Touch states for validation
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirm: false,
    firstName: false,
    lastName: false,
    company: false,
    files: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPartner = selectedRole && selectedRole !== "entrepreneur";
  const passwordValid = isPasswordValid(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const emailValid = isValidEmail(email);

  const isFormReady =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    emailValid &&
    passwordValid &&
    passwordsMatch &&
    (isPartner ? companyName.trim() !== "" && files.length > 0 : true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true, confirm: true, firstName: true, lastName: true, company: true, files: true });
    if (!selectedRole || !isFormReady) return;

    setIsSubmitting(true);
    try {
      await onNext(
        {
          role: selectedRole,
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          email: email.trim().toLowerCase(),
          password,
          confirm_password: confirmPassword,
          company_name: isPartner ? companyName : undefined,
          description: isPartner && description ? description : undefined,
          files: isPartner ? files : undefined,
        },
        selectedRole
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // — Role selector screen —
  if (!selectedRole) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">I am a…</h2>
          <p className="text-sm text-gray-500 mt-1">Choose your role to get started</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ROLE_CARDS.map(({ role, icon: Icon, title, subtitle }) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 bg-white text-left hover:border-cyan-400 hover:bg-cyan-50/40 transition-all"
            >
              <Icon className="w-5 h-5 mt-0.5 shrink-0 text-gray-400" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{subtitle}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <GoogleButton label="Continue with Google" />
      </div>
    );
  }

  const selectedCard = ROLE_CARDS.find((c) => c.role === selectedRole)!;

  // — Registration form —
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Role badge + change */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <selectedCard.icon className="w-4 h-4 text-cyan-600" />
          <span className="text-sm font-medium text-cyan-700">{selectedCard.title}</span>
        </div>
        <button
          type="button"
          onClick={() => setSelectedRole(null)}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Change role
        </button>
      </div>

      {/* Name row */}
      <div className="space-y-1">
        <Label className="text-xs text-gray-500">Name</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Input
              placeholder="First name"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
              disabled={isSubmitting}
              className={cn(
                touched.firstName && !firstName.trim() && "border-red-400"
              )}
            />
          </div>
          <div>
            <Input
              placeholder="Last name"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
              disabled={isSubmitting}
              className={cn(
                touched.lastName && !lastName.trim() && "border-red-400"
              )}
            />
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1">
        <Label htmlFor="email" className="text-xs text-gray-500">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          disabled={isSubmitting}
          className={cn(
            touched.email && !emailValid && "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/20",
            touched.email && emailValid && "border-cyan-500"
          )}
        />
        {touched.email && !emailValid && (
          <p className="text-xs text-red-500">Please enter a valid email address</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <Label htmlFor="password" className="text-xs text-gray-500">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => { setPasswordFocused(false); setTouched((t) => ({ ...t, password: true })); }}
            disabled={isSubmitting}
            className={cn(
              "pr-10",
              touched.password && !passwordValid && "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/20",
              touched.password && passwordValid && "border-cyan-500"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <PasswordStrength password={password} visible={passwordFocused || (touched.password && password.length > 0)} />
      </div>

      {/* Confirm password */}
      <div className="space-y-1">
        <Label htmlFor="confirm" className="text-xs text-gray-500">Confirm Password</Label>
        <Input
          id="confirm"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          disabled={isSubmitting}
          className={cn(
            touched.confirm && confirmPassword.length > 0 && !passwordsMatch && "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/20",
            touched.confirm && passwordsMatch && "border-cyan-500"
          )}
        />
        {touched.confirm && confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-xs text-red-500">Passwords do not match</p>
        )}
      </div>

      {/* Partner-only fields */}
      {isPartner && (
        <>
          <div className="space-y-1">
            <Label htmlFor="company" className="text-xs text-gray-500">Company Name</Label>
            <Input
              id="company"
              placeholder="Your company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, company: true }))}
              disabled={isSubmitting}
              className={cn(
                touched.company && !companyName.trim() && "border-red-400"
              )}
            />
            {touched.company && !companyName.trim() && (
              <p className="text-xs text-red-500">Company name is required</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-xs text-gray-500">
              Description <span className="text-gray-400">(optional)</span>
            </Label>
            <textarea
              id="description"
              placeholder="Brief description of your business"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={2}
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500 disabled:opacity-50 transition-colors resize-none"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="files" className="text-xs text-gray-500">
              Supporting Documents <span className="text-red-400">*</span>
            </Label>
            <input
              id="files"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={isSubmitting}
              onChange={(e) => {
                const selected = e.target.files ? Array.from(e.target.files) : [];
                setFiles(selected);
                setTouched((t) => ({ ...t, files: true }));
              }}
              className="flex w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-colors cursor-pointer"
            />
            {touched.files && files.length === 0 && (
              <p className="text-xs text-red-500">At least one document is required</p>
            )}
            {files.length > 0 && (
              <p className="text-xs text-cyan-600">{files.length} file(s) selected</p>
            )}
          </div>
        </>
      )}

      <Button
        type="submit"
        variant="primary-gradient"
        size="lg"
        className="w-full mt-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating account…" : "Continue"}
      </Button>
    </form>
  );
}

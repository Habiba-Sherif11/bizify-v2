"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entrepreneurSignupSchema, partnerSignupSchema } from "../lib/validations";
import { Button } from "@/components/ui/button";

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

export function AccountStep({ onNext }: Props) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const entrepreneurForm = useForm({
    resolver: zodResolver(entrepreneurSignupSchema),
  });

  const partnerForm = useForm({
    resolver: zodResolver(partnerSignupSchema),
  });

  const handleSubmitEntrepreneur = (data: any) => {
    onNext({ ...data, role: "entrepreneur" }, "entrepreneur");
  };

  const handleSubmitPartner = (data: any) => {
    // Ensure files array
    if (!data.files || data.files.length === 0) {
      partnerForm.setError("files", { message: "At least one file is required" });
      return;
    }
    onNext(
      {
        ...data,
        role: selectedRole!,
        files: Array.from(data.files),
      },
      selectedRole!
    );
  };

  if (!selectedRole) {
    return (
      <div className="space-y-5">
        <h2 className="text-2xl font-semibold font-[var(--font-cormorant-sc)]">
          Choose Your Role
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {(["entrepreneur", "manufacturer", "mentor", "supplier"] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className="rounded-lg border border-neutral-200 p-6 text-center hover:bg-amber-50 transition"
            >
              <span className="text-lg font-medium capitalize">{role}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Entrepreneur form
  if (selectedRole === "entrepreneur") {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = entrepreneurForm;
    return (
      <form onSubmit={handleSubmit(handleSubmitEntrepreneur)} className="space-y-5">
        <h2 className="text-2xl font-semibold font-[var(--font-cormorant-sc)]">
          Entrepreneur Registration
        </h2>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Full Name</label>
          <input {...register("full_name")} className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm" />
          {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message as string}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Email</label>
          <input {...register("email")} type="email" className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Password</label>
          <input {...register("password")} type="password" className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
          <p className="text-neutral-500 text-xs mt-1">At least 8 characters, with uppercase, lowercase, and number</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Confirm Password</label>
          <input {...register("confirm_password")} type="password" className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm" />
          {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message as string}</p>}
        </div>
        <Button type="submit" variant="primary-gradient" size="lg" className="w-full" disabled={isSubmitting}>
          Continue
        </Button>
      </form>
    );
  }

  // Partner form (manufacturer, mentor, supplier)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = partnerForm;
  return (
    <form onSubmit={handleSubmit(handleSubmitPartner)} className="space-y-5">
      <h2 className="text-2xl font-semibold font-[var(--font-cormorant-sc)] capitalize">
        {selectedRole} Registration
      </h2>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Full Name</label>
        <input {...register("full_name")} className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm" />
        {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message as string}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Email</label>
        <input {...register("email")} type="email" className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Password</label>
        <input {...register("password")} type="password" className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm" />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
        <p className="text-neutral-500 text-xs mt-1">At least 8 characters, with uppercase, lowercase, and number</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Confirm Password</label>
        <input {...register("confirm_password")} type="password" className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm" />
        {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message as string}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Company Name</label>
        <input {...register("company_name")} className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm" />
        {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name.message as string}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Description (optional)</label>
        <textarea {...register("description")} rows={3} className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Services (JSON, optional)</label>
        <textarea {...register("services")} rows={3} className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Experience (JSON, optional)</label>
        <textarea {...register("experience")} rows={3} className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Upload Supporting Files</label>
        <input
          type="file"
          multiple
          onChange={(e) => {
            const files = e.target.files ? Array.from(e.target.files) : [];
            partnerForm.setValue("files", files as any);
          }}
          className="mt-1 w-full"
        />
        {errors.files && <p className="text-red-500 text-xs mt-1">{errors.files.message as string}</p>}
      </div>
      <Button type="submit" variant="primary-gradient" size="lg" className="w-full" disabled={isSubmitting}>
        Continue
      </Button>
    </form>
  );
}
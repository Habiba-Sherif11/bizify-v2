import { z } from "zod";

// Entrepreneur registration (no role needed, backend defaults to ENTREPRENEUR)
export const entrepreneurSignupSchema = z
  .object({
    full_name: z.string().min(2, "Name required"),
    email: z.string().email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

// Partner registration (requires role, files, and extra fields)
export const partnerSignupSchema = z
  .object({
    full_name: z.string().min(2, "Name required"),
    email: z.string().email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirm_password: z.string(),
    company_name: z.string().min(1, "Company name required"),
    description: z.string().optional(),
    services: z.string().optional(),
    experience: z.string().optional(),
    files: z.array(z.instanceof(File)).min(1, "At least one file is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const otpSchema = z.object({
  otp_code: z.string().length(6, "Must be 6 digits"),
});

export const forgotSchema = z.object({
  email: z.string().email(),
});

export const resetSchema = z
  .object({
    email: z.string().email(),
    otp_code: z.string().length(6),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const skillsSchema = z.object({
  skills: z.array(z.string()).min(1, "Add at least one skill"),
});
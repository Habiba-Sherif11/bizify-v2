"use client";

import { useState } from "react";
import { api } from "../lib/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

type Role = "entrepreneur" | "manufacturer" | "mentor" | "supplier";

/**
 * Extracts a human-readable error message from an axios error.
 * Handles every possible response shape: JSON object, HTML string, network errors.
 */
function extractErrorMessage(error: unknown, fallback: string): string {
  // Log the raw error so we can see exactly what's failing
  console.error("[Signup] Raw error:", error);

  if (!error || typeof error !== "object") return fallback;

  const e = error as Record<string, unknown>;
  const response = e.response as Record<string, unknown> | undefined;

  // No response → network error or server completely down
  if (!response) {
    const msg = typeof e.message === "string" ? e.message : "";
    if (msg.toLowerCase().includes("timeout") || (e as Record<string, unknown>).code === "ECONNABORTED") {
      return "The server took too long to respond. Please try again.";
    }
    return msg || fallback;
  }

  const data = response.data;
  console.error("[Signup] Response status:", response.status, "data:", data);

  // data is a plain object — try common message fields
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const d = data as Record<string, unknown>;

    // { error: "..." }
    if (typeof d.error === "string" && d.error) return d.error;

    // { detail: "..." }
    if (typeof d.detail === "string" && d.detail) return d.detail;

    // { detail: [{ msg: "..." }] }
    if (Array.isArray(d.detail) && d.detail.length > 0) {
      const first = d.detail[0] as Record<string, unknown>;
      if (typeof first.msg === "string") return first.msg;
    }

    // { message: "..." }
    if (typeof d.message === "string" && d.message) return d.message;
  }

  // data is a string (HTML error page or plain text)
  if (typeof data === "string" && data.length < 300 && !data.startsWith("<")) {
    return data;
  }

  return fallback;
}

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE_MB = 5;

function validateFiles(files: File[]): string | null {
  for (const file of files) {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `"${file.name}" is not allowed. Only JPEG, PNG, and PDF files are accepted.`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`;
    }
  }
  return null;
}

export function useSignup() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { fetchUser } = useAuth();
  const router = useRouter();

  const handleStep1 = async (
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
  ) => {
    setSelectedRole(role);
    setEmail(data.email);
    setTempPassword(data.password);

    toast.info(
      "Connecting to server… this may take up to 60 seconds on first load.",
      { autoClose: false, toastId: "wakeup" }
    );

    try {
      if (role === "entrepreneur") {
        await api.post("/auth/signup", {
          full_name: data.full_name,
          email: data.email,
          password: data.password,
          confirm_password: data.confirm_password,
        });
      } else {
        if (data.files && data.files.length > 0) {
          const fileError = validateFiles(data.files);
          if (fileError) {
            toast.error(fileError);
            return;
          }
        }

        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("full_name", data.full_name);
        formData.append("role", role);
        formData.append("password", data.password);
        formData.append("confirm_password", data.confirm_password);

        if (data.company_name) formData.append("company_name", data.company_name);
        if (data.description) formData.append("description", data.description);
        if (data.services) formData.append("services_json", data.services);
        if (data.experience) formData.append("experience_json", data.experience);

        if (data.files) {
          data.files.forEach((file) => formData.append("files", file));
        }

        await api.post("/auth/register-partner", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.dismiss("wakeup");
      setStep(2);
      toast.success("OTP sent to your email");
    } catch (error) {
      toast.dismiss("wakeup");
      toast.error(extractErrorMessage(error, "Registration failed. Please try again."));
    }
  };

  const handleOtp = async (otp_code: string) => {
    if (!email) {
      toast.error("Email missing. Please restart.");
      setStep(1);
      return;
    }

    try {
      await api.post("/auth/verify-otp", { email, otp_code });
      toast.success("Email verified");

      await api.post("/auth/login", { email, password: tempPassword });
      await fetchUser();

      if (selectedRole === "entrepreneur") {
        setStep(3);
      } else {
        toast.success("Registration successful! Redirecting...");
        router.push(`/${selectedRole}`);
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, "OTP verification failed. Please try again."));
    }
  };

  const handleQuestionnaire = async (payload: { choices: string[] }[]) => {
    try {
      const cleanPayload = payload.filter((p) => p.choices.length > 0);
      await api.post("/auth/questionnaire", cleanPayload);
      setStep(4);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to save questionnaire."));
    }
  };

  const handleSkills = async (skills: { predefined_skill_id?: string; skill_name?: string }[]) => {
    try {
      // Add each skill one at a time (API requirement)
      for (const skill of skills) {
        await api.post("/profile/skills", skill);
      }
      // Finalize onboarding
      await api.post("/profile/complete");
      setStep(5);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to save skills. Please try again."));
    }
  };

  return {
    step,
    email,
    selectedRole,
    handleStep1,
    handleOtp,
    handleQuestionnaire,
    handleSkills,
  };
}

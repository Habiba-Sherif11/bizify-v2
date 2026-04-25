import { useState } from "react";
import { api } from "../lib/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

type Role = "entrepreneur" | "manufacturer" | "mentor" | "supplier";

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
        try {
            setSelectedRole(role);
            setEmail(data.email);
            setTempPassword(data.password);

            if (role === "entrepreneur") {
                await api.post("/auth/signup", {
                    full_name: data.full_name,
                    email: data.email,
                    password: data.password,
                    confirm_password: data.confirm_password,
                });
            } else {
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

            setStep(2);
            toast.success("OTP sent to your email");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Registration failed");
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
                setTimeout(() => {
                    router.push(`/${selectedRole}`);
                }, 1500);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "OTP verification failed");
        }
    };

    // ✅ FIXED
    const handleQuestionnaire = async (payload: any[]) => {
        try {
            // Remove empty answers (optional but safer)
            const cleanPayload = payload.filter((p) => p.choices.length > 0);

            console.log("🚀 FINAL PAYLOAD:", JSON.stringify(cleanPayload, null, 2));

            await api.post("/auth/questionnaire", payload);

            setStep(4);
        } catch (error: any) {
            console.log("❌ BACKEND ERROR:", error.response?.data);
            toast.error("Failed to save questionnaire");
        }
    };

    const handleSkills = async (skills: string[]) => {
        // No backend API call – skills are only shown on the UI
        // Just move to the success step
        setStep(5);
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
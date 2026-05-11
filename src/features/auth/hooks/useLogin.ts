import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../lib/api";
import { useRouter, useSearchParams } from "next/navigation";

export function useLogin(options?: { redirect?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post("/auth/login", credentials);
      return response;
    },

    onSuccess: () => {
      toast.success("Logged in successfully");
      if (options?.redirect !== false) {
        router.push(callbackUrl ?? "/dashboard");
      }
    },

    // No toast here — the component shows an inline error banner
  });
}

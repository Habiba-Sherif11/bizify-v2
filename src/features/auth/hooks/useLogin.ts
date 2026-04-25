import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export function useLogin(options?: { redirect?: boolean }) {
  const { fetchUser } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post("/auth/login", credentials);
      return response;
    },

    onSuccess: async () => {
      toast.success("Logged in successfully");

      // Fetch user info to get role (this sets user in AuthContext)
      await fetchUser();

      // Only redirect if explicitly allowed (default is true)
      if (options?.redirect !== false) {
        // Use the user role from auth context (already fetched above)
        // Default to entrepreneur if role not available
        router.push("/entrepreneur");
      }
    },

    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || "Login failed";
      toast.error(errorMsg);
    },
  });
}
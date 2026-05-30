import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const roleRoutes: Record<string, string> = {
  entrepreneur: "/entrepreneur",
  manufacturer: "/manufacturer",
  mentor: "/mentor",
  supplier: "/supplier",
  admin: "/admin",
};

export function useLogin(options?: { redirect?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const { fetchUser } = useAuth();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post("/auth/login", credentials);
      return response;
    },

    onSuccess: async () => {
      toast.success("Logged in successfully");
      if (options?.redirect !== false) {
        // Always fetch user after login so AuthContext is populated before navigation
        const user = await fetchUser();
        if (callbackUrl) {
          router.push(callbackUrl);
          return;
        }
        const destination = user?.role && roleRoutes[user.role]
          ? roleRoutes[user.role]
          : "/dashboard";
        router.push(destination);
      }
    },

    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { error?: string } } })
          ?.response?.data?.error ?? "Invalid credentials. Please try again.";
      toast.error(message);
    },
  });
}

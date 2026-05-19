"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { api } from "../lib/api";

export type User = {
  email: string;
  role: "entrepreneur" | "manufacturer" | "mentor" | "supplier" | "admin";
  name?: string;
  approval_status?: "PENDING" | "APPROVED" | "REJECTED";
  business_id?: string;
};

const PARTNER_ROLES = new Set(["manufacturer", "mentor", "supplier"]);

type AuthContextType = {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<User | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      return data.user;
    } catch {
      // Only fires on network errors (401 is handled by the API interceptor)
      toast.error("Connection error. Please try again.");
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Redirect unapproved partners away from the main app
  useEffect(() => {
    if (loading || !user) return;
    if (!PARTNER_ROLES.has(user.role)) return;
    const isPending =
      user.approval_status === "PENDING" || user.approval_status === "REJECTED";
    if (isPending && pathname !== "/partner-pending") {
      router.replace("/partner-pending");
    }
  }, [user, loading, pathname, router]);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Even if the server call fails, clear local state and redirect
    }
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext not wrapped");
  return ctx;
};
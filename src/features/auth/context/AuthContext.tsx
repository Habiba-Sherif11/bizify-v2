"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { api } from "../lib/api";

export type User = {
  email: string;
  role: "entrepreneur" | "manufacturer" | "mentor" | "supplier" | "admin";
  name?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      // data.user can be null (if no token) or a user object
      setUser(data.user);
    } catch (error: any) {
      // This catch now only fires on network errors, not on 401
      console.error("Network error while fetching user:", error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
  }, []);

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
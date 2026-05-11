"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { User } from "@/features/auth/context/AuthContext";

const roleRoutes: Record<User["role"], string> = {
  entrepreneur: "/entrepreneur",
  manufacturer: "/manufacturer",
  mentor: "/mentor",
  supplier: "/supplier",
  admin: "/admin",
};

export default function DashboardRedirect() {
  const { user, fetchUser } = useAuth();
  const router = useRouter();
  const [fetching, setFetching] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Always re-fetch after login so we have fresh user + role
    fetchUser()
      .then((u) => {
        if (u?.role && roleRoutes[u.role]) {
          router.replace(roleRoutes[u.role]);
        } else {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true))
      .finally(() => setFetching(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (failed || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-neutral-600">Could not load your session.</p>
          <button
            onClick={() => router.replace("/login")}
            className="text-sm text-cyan-600 hover:underline"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
    </div>
  );
}

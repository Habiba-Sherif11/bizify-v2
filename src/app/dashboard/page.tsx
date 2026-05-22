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

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

export default function DashboardRedirect() {
  const { user, fetchUser } = useAuth();
  const router = useRouter();
  const [fetching, setFetching] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function tryFetch() {
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const u = await fetchUser();
        if (cancelled) return;

        if (u?.role && roleRoutes[u.role]) {
          router.replace(roleRoutes[u.role]);
          return;
        }

        if (attempt < MAX_RETRIES - 1) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
      }

      if (!cancelled) {
        setFailed(true);
        setFetching(false);
      }
    }

    tryFetch().catch(() => {
      if (!cancelled) {
        setFailed(true);
        setFetching(false);
      }
    });

    return () => {
      cancelled = true;
    };
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

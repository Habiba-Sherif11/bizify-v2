"use client";

import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/components/ui/button";

export function RoleDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 flex flex-col items-center gap-4 w-full max-w-sm text-center">
        <div className="space-y-1">
          <p className="text-sm font-medium text-neutral-400 uppercase tracking-widest">
            {user?.role ?? "—"}
          </p>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Welcome, {user?.name || user?.email || "there"}
          </h1>
        </div>

        <Button variant="outline" className="w-full" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
}

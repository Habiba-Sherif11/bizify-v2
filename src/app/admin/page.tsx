"use client";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-red-600">Bizify - Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600">{user?.email}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg border border-neutral-200 p-8 shadow-sm">
          <h2 className="text-3xl font-semibold text-neutral-900 mb-4">
            Welcome, {user?.name || "Admin"}!
          </h2>
          <p className="text-neutral-600 mb-8">
            Administer and manage the Bizify platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {["Users", "Analytics", "Settings", "Logs", "Compliance", "Support"].map((item) => (
              <div
                key={item}
                className="p-6 rounded-lg border border-neutral-200 hover:border-red-500 hover:bg-red-50 transition cursor-pointer"
              >
                <h3 className="font-semibold text-neutral-900">{item}</h3>
                <p className="text-sm text-neutral-600 mt-2">Coming soon...</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Handshake,
  ShieldAlert,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/security", label: "Security", icon: ShieldAlert },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-neutral-200 flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-neutral-200">
          <span className="text-base font-bold text-neutral-900">
            Bizify<span className="text-amber-500">AI</span>
          </span>
          <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-400 bg-neutral-100 rounded px-1.5 py-0.5">
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                  active
                    ? "bg-amber-50 text-amber-600"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                )}
              >
                <Icon size={16} className={active ? "text-amber-500" : "text-neutral-400 group-hover:text-neutral-600"} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto text-amber-400" />}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-neutral-200 p-3">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-xs uppercase shrink-0">
              {(user?.name || user?.email || "A").charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-neutral-800 truncate">
                {user?.name || user?.email || "Admin"}
              </p>
              <p className="text-[10px] text-neutral-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-auto">
        {children}
      </div>
    </div>
  );
}

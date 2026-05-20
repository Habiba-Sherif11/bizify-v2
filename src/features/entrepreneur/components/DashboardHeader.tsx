"use client";

import { ChevronDown, LogOut, User, Settings, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTheme } from "@/features/dashboard/context/ThemeContext";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";

// ─── Logout confirmation dialog ───────────────────────────────────────────────

function LogoutConfirmDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-xl w-full max-w-sm mx-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Log out?</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Are you sure you want to log out of your account?</p>
        <div className="mt-5 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 bg-neutral-100 dark:bg-neutral-700 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Nav icon button ──────────────────────────────────────────────────────────

function NavButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="w-9 h-9 justify-center bg-white dark:bg-neutral-800 rounded-[10px] outline-[0.67px] outline-offset-[-0.67px] outline-black/10 dark:outline-white/10 flex items-center cursor-pointer"
    >
      {children}
    </button>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogoutClick = () => {
    setShowMenu(false);
    setShowLogoutConfirm(true);
  };

  const handleProfileClick = () => {
    setShowMenu(false);
    router.push("/entrepreneur/profile");
  };

  const handleSettingsClick = () => {
    setShowMenu(false);
    router.push("/entrepreneur/settings");
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-neutral-100/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">

        {/* ── Left: user identity ── */}
        <div className="relative flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-cyan-500 to-cyan-600 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0 overflow-hidden">
              <span className="text-white text-xs font-semibold">{initials}</span>
            </div>

            {/* Name + email */}
            <div className="flex flex-col gap-[2.9px]">
              <div className="flex items-center gap-2">
                <span className="text-black dark:text-white text-sm font-medium leading-none">
                  {user?.name || user?.email?.split("@")[0] || "User"}
                </span>
                <ChevronDown size={16} className="text-black dark:text-white shrink-0" />
              </div>
              <span className="text-neutral-500 dark:text-neutral-400 text-xs font-light">
                {user?.email}
              </span>
            </div>
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute top-full mt-2 start-0 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg p-1 z-50 min-w-44">
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer"
                >
                  <User size={14} />
                  Profile
                </button>
                <button
                  type="button"
                  onClick={handleSettingsClick}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer"
                >
                  <Settings size={14} />
                  Settings
                </button>
                <div className="my-1 h-px bg-gray-100 dark:bg-neutral-700" />
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg cursor-pointer"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Right: action buttons ── */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Theme toggle */}
          <NavButton
            onClick={toggleTheme}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark"
              ? <Sun size={16} className="text-cyan-600 dark:text-cyan-400" />
              : <Moon size={16} className="text-cyan-600" />
            }
          </NavButton>

          {/* Notifications */}
          <NotificationBell />
        </div>
      </header>

      {/* Logout confirmation dialog */}
      {showLogoutConfirm && (
        <LogoutConfirmDialog
          onConfirm={() => { setShowLogoutConfirm(false); logout(); }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
}

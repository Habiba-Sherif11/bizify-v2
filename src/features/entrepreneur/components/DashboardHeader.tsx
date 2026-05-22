"use client";

import { Bell, ChevronDown, LogOut, User, Settings, Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTheme } from "@/features/dashboard/context/ThemeContext";

// ─── Logout confirmation dialog ───────────────────────────────────────────────

function LogoutConfirmDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
      return;
    }
    if (e.key !== "Tab") return;

    const focusable = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
      aria-hidden="true"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-desc"
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="bg-background dark:bg-neutral-800 rounded-2xl p-6 shadow-xl w-full max-w-sm mx-4"
      >
        <h3 id="logout-dialog-title" className="text-base font-semibold text-gray-900 dark:text-white">
          Log out?
        </h3>
        <p id="logout-dialog-desc" className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Are you sure you want to log out of your account?
        </p>
        <div className="mt-5 flex gap-3 justify-end">
          <button
            ref={cancelRef}
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
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel ?? title}
      className="w-11 h-11 justify-center bg-background dark:bg-neutral-800 rounded-[10px] ring-1 ring-black/10 dark:ring-white/10 flex items-center cursor-pointer transition-colors hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60"
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    function handleOutsideClick(e: MouseEvent) {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showMenu]);

  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []
    );
    const idx = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Escape" || e.key === "Tab") {
      setShowMenu(false);
    }
  }, []);

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
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-[#E9E9E9] dark:border-neutral-800/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between header-enter">

        {/* ── Center: brand ── */}
        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none select-none">
          <span
            className="text-xl font-normal tracking-[0.02em] text-neutral-900 dark:text-white leading-none"
            style={{ fontFamily: "var(--font-cormorant-sc)" }}
          >
            Bizify
          </span>
        </div>

        {/* ── Left: user identity ── */}
        <div ref={menuContainerRef} className="relative flex items-center gap-2.5 ">
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            aria-expanded={showMenu}
            aria-haspopup="menu"
            aria-label="User menu"
            className="no-lift flex items-center gap-2.5 cursor-pointer"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center shrink-0 overflow-hidden">
              <span className="text-neutral-700 dark:text-neutral-200 text-xs font-semibold">{initials}</span>
            </div>

            {/* Name + email */}
            <div className="flex flex-col gap-[2.9px]">
              <div className="flex items-center gap-2">
                <span className="text-black dark:text-white text-sm font-medium leading-none">
                  {user?.name || user?.email?.split("@")[0] || "User"}
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "text-black dark:text-white shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    showMenu && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </div>
              <span className="text-neutral-500 dark:text-neutral-400 text-xs font-light">
                {user?.email}
              </span>
            </div>
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="User options"
              onKeyDown={handleMenuKeyDown}
              className="absolute top-full mt-2 inset-s-0 bg-background dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg p-1 z-50 min-w-44 dropdown-enter"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleProfileClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <User size={14} aria-hidden="true" />
                Profile
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleSettingsClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <Settings size={14} aria-hidden="true" />
                Settings
              </button>
              <div role="separator" className="my-1 h-px bg-gray-100 dark:bg-neutral-700" />
              <button
                type="button"
                role="menuitem"
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut size={14} aria-hidden="true" />
                Log out
              </button>
            </div>
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
              ? <Sun size={16} className="text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
              : <Moon size={16} className="text-neutral-500" aria-hidden="true" />
            }
          </NavButton>

          {/* Notifications */}
          <div className="relative">
            <NavButton
              aria-label="Notifications"
              onClick={() => setShowNotifications((v) => !v)}
            >
              <Bell size={16} className="text-gray-500 dark:text-gray-400" aria-hidden="true" />
            </NavButton>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute top-full right-0 mt-2 bg-background dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg p-4 z-50 w-64 dropdown-enter-right">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#1C1C1E] dark:text-white mb-3">
                    Notifications
                  </p>
                  <p className="text-sm text-[#8C8C8C] dark:text-neutral-400">
                    No notifications yet.
                  </p>
                </div>
              </>
            )}
          </div>
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

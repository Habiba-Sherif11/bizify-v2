"use client";

import { Bell, ChevronDown, LogOut, User, Settings, Moon, Sun, Menu, X, BookOpen } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTheme } from "@/features/dashboard/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

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
          <Button
            ref={cancelRef}
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white border-0"
          >
            Log out
          </Button>
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
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel ?? title}
      className="w-11 h-11 bg-background dark:bg-neutral-800 rounded-[10px] ring-1 ring-black/10 dark:ring-white/10 border-0 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60"
    >
      {children}
    </Button>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  const handleConceptsGuideClick = () => {
    setShowMenu(false);
    router.push("/entrepreneur/concepts-guide");
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-[#E9E9E9] dark:border-neutral-800/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between header-enter">

        {/* ── Center: brand ── */}
        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none select-none hidden sm:block">
          <span
            className="text-xl font-normal tracking-[0.02em] text-neutral-900 dark:text-white leading-none"
            style={{ fontFamily: "var(--font-cormorant-sc)" }}
          >
            Bizify
          </span>
        </div>

        {/* ── Left: user identity ── */}
        <div ref={menuContainerRef} className="relative flex items-center gap-2.5">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowMenu((v) => !v)}
            aria-expanded={showMenu}
            aria-haspopup="menu"
            aria-label="User menu"
            className="no-lift flex items-center gap-2.5 h-auto p-0 hover:bg-transparent"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center shrink-0 overflow-hidden">
              <span className="text-neutral-700 dark:text-neutral-200 text-xs font-semibold">{initials}</span>
            </div>

            {/* Name + email */}
            <div className="flex flex-col gap-[2.9px]">
              <div className="flex items-center gap-2">
                <span className="text-black dark:text-white text-sm font-medium leading-none max-w-22.5 sm:max-w-40 truncate">
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
              <span className="hidden sm:block text-neutral-500 dark:text-neutral-400 text-xs font-light truncate max-w-40">
                {user?.email}
              </span>
            </div>
          </Button>

          {/* Dropdown menu */}
          {showMenu && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="User options"
              onKeyDown={handleMenuKeyDown}
              className="absolute top-full mt-2 inset-s-0 bg-background dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg p-1 z-50 min-w-44 dropdown-enter"
            >
              <Button
                type="button"
                role="menuitem"
                variant="ghost"
                onClick={handleProfileClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg justify-start h-auto font-normal"
              >
                <User size={14} aria-hidden="true" />
                Profile
              </Button>
              <Button
                type="button"
                role="menuitem"
                variant="ghost"
                onClick={handleSettingsClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg justify-start h-auto font-normal"
              >
                <Settings size={14} aria-hidden="true" />
                Settings
              </Button>
              <Button
                type="button"
                role="menuitem"
                variant="ghost"
                onClick={handleConceptsGuideClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg justify-start h-auto font-normal"
              >
                <BookOpen size={14} aria-hidden="true" />
                Concepts Guide
              </Button>
              <Separator className="my-1 bg-gray-100 dark:bg-neutral-700" />
              <Button
                type="button"
                role="menuitem"
                variant="ghost"
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg justify-start h-auto font-normal hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut size={14} aria-hidden="true" />
                Log out
              </Button>
            </div>
          )}
        </div>

        {/* ── Right: action buttons ── */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Desktop: theme + notifications (hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-3">
            <NavButton
              onClick={toggleTheme}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark"
                ? <Sun size={16} className="text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
                : <Moon size={16} className="text-neutral-500" aria-hidden="true" />
              }
            </NavButton>

            <Popover>
              <PopoverTrigger asChild>
                <NavButton aria-label="Notifications">
                  <Bell size={16} className="text-gray-500 dark:text-gray-400" aria-hidden="true" />
                </NavButton>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#1C1C1E] dark:text-white mb-3">
                  Notifications
                </p>
                <p className="text-sm text-[#8C8C8C] dark:text-neutral-400">
                  No notifications yet.
                </p>
              </PopoverContent>
            </Popover>
          </div>

          {/* Mobile: hamburger (hidden on sm+) */}
          <div className="relative sm:hidden">
            <NavButton
              aria-label={showMobileMenu ? "Close menu" : "Open menu"}
              onClick={() => setShowMobileMenu((v) => !v)}
            >
              {showMobileMenu
                ? <X size={16} className="text-neutral-500" aria-hidden="true" />
                : <Menu size={16} className="text-neutral-500" aria-hidden="true" />
              }
            </NavButton>

            {showMobileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMobileMenu(false)} />
                <div className="absolute top-full right-0 mt-2 bg-background dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg p-1 z-50 w-52 dropdown-enter-right">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { toggleTheme(); setShowMobileMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 rounded-lg justify-start h-auto font-normal"
                  >
                    {theme === "dark"
                      ? <Sun size={15} className="text-neutral-500 dark:text-neutral-400 shrink-0" aria-hidden="true" />
                      : <Moon size={15} className="text-neutral-500 shrink-0" aria-hidden="true" />
                    }
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                  </Button>
                  <Separator className="my-1 bg-gray-100 dark:bg-neutral-700" />
                  <div className="px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-2">
                      <Bell size={13} aria-hidden="true" />
                      Notifications
                    </p>
                    <p className="text-sm text-neutral-400 dark:text-neutral-500">
                      No notifications yet.
                    </p>
                  </div>
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

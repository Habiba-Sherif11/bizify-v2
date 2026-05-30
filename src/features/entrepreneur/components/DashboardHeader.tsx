"use client";

import { Bell, ChevronDown, LogOut, User, Settings, Moon, Sun, Menu, X, BookOpen, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useTheme } from "@/features/dashboard/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { TokenUsageWidget } from "./TokenUsageWidget";

// Design System tokens from DESIGN.md
const TOKENS = {
  colors: {
    paper: "#FAFAFA",
    ink: "#1C1C1E",
    mist: "#E9E9E9",
    ash: "#8C8C8C",
    clarityDeep: "#0891B2",
    clarity: "#06B6D4",
  },
  radius: { lg: "10px", xl: "14px" },
  spacing: { xs: "8px", sm: "12px", md: "16px", lg: "24px" },
};

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
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-desc"
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#FAFAFA] dark:bg-neutral-800 rounded-[14px] p-6 shadow-xl w-full max-w-sm mx-4"
      >
        <h3
          id="logout-dialog-title"
          className="text-base font-semibold text-[#1C1C1E] dark:text-white"
        >
          Log out?
        </h3>
        <p
          id="logout-dialog-desc"
          className="mt-3 text-sm text-[#8C8C8C] dark:text-neutral-400"
        >
          Are you sure you want to log out of your account?
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <Button
            ref={cancelRef}
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-9 px-5 rounded-[10px] text-sm font-medium focus-visible:ring-2 focus-visible:ring-[#06B6D4]/20 focus-visible:ring-offset-2"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="h-9 px-5 rounded-[10px] text-sm font-medium bg-[#E53935] hover:bg-red-600 text-white border-0 focus-visible:ring-2 focus-visible:ring-[#E53935]/20 focus-visible:ring-offset-2"
          >
            Log out
          </Button>
        </div>
      </motion.div>
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
      className="w-10 h-10 bg-[#FAFAFA] dark:bg-neutral-800 rounded-[10px] ring-1 ring-[#E9E9E9] dark:ring-white/10 border-0 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#06B6D4]/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900"
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

  const handleUpgradePlanClick = () => {
    setShowMenu(false);
    router.push("/entrepreneur/upgrade-plan");
  };

  return (
    <>
      <motion.header
        className="sticky top-0 z-40 bg-[#FAFAFA]/95 dark:bg-neutral-900/95 backdrop-blur-sm border-b border-[#E9E9E9] dark:border-neutral-800/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4"
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        role="banner"
      >
        {/* ── Left: user identity (high priority on mobile) ── */}
        <div ref={menuContainerRef} className="relative flex items-center gap-3 flex-shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowMenu((v) => !v)}
            aria-expanded={showMenu}
            aria-haspopup="menu"
            aria-label={`User menu: ${user?.name || user?.email || "User"}`}
            className="no-lift flex items-center gap-2.5 h-auto p-1.5 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-[#06B6D4]/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 rounded-[8px]"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-700 border border-[#E9E9E9] dark:border-neutral-600 flex items-center justify-center shrink-0 overflow-hidden">
              <span className="text-[#1C1C1E] dark:text-neutral-200 text-xs font-semibold">
                {initials}
              </span>
            </div>

            {/* Name + chevron */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[#1C1C1E] dark:text-white text-sm font-medium leading-none truncate max-w-[100px] sm:max-w-[140px]">
                {user?.name || user?.email?.split("@")[0] || "User"}
              </span>
              <ChevronDown
                size={16}
                className={cn(
                  "text-[#8C8C8C] dark:text-neutral-400 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  showMenu && "rotate-180"
                )}
                aria-hidden="true"
              />
            </div>
          </Button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                ref={menuRef}
                role="menu"
                aria-label="User options"
                onKeyDown={handleMenuKeyDown}
                className="absolute top-full mt-2 left-0 bg-[#FAFAFA] dark:bg-neutral-800 border border-[#E9E9E9] dark:border-neutral-700 rounded-[14px] shadow-lg p-1 z-50 min-w-44"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "top left" }}
              >
                <Button
                  type="button"
                  role="menuitem"
                  variant="ghost"
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1C1C1E] dark:text-neutral-200 rounded-[10px] justify-start h-auto font-normal hover:bg-neutral-100 dark:hover:bg-neutral-700 focus-visible:ring-2 focus-visible:ring-[#06B6D4]/50"
                >
                  <User size={16} aria-hidden="true" className="text-[#8C8C8C]" />
                  Profile
                </Button>
                <Button
                  type="button"
                  role="menuitem"
                  variant="ghost"
                  onClick={handleSettingsClick}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1C1C1E] dark:text-neutral-200 rounded-[10px] justify-start h-auto font-normal hover:bg-neutral-100 dark:hover:bg-neutral-700 focus-visible:ring-2 focus-visible:ring-[#06B6D4]/50"
                >
                  <Settings size={16} aria-hidden="true" className="text-[#8C8C8C]" />
                  Settings
                </Button>
                <Button
                  type="button"
                  role="menuitem"
                  variant="ghost"
                  onClick={handleConceptsGuideClick}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1C1C1E] dark:text-neutral-200 rounded-[10px] justify-start h-auto font-normal hover:bg-neutral-100 dark:hover:bg-neutral-700 focus-visible:ring-2 focus-visible:ring-[#06B6D4]/50"
                >
                  <BookOpen size={16} aria-hidden="true" className="text-[#8C8C8C]" />
                  Concepts Guide
                </Button>
                
                <Separator className="my-1 bg-[#E9E9E9] dark:bg-neutral-700" />
                <Button
                  type="button"
                  role="menuitem"
                  variant="ghost"
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-[10px] justify-start h-auto font-normal hover:bg-red-50 dark:hover:bg-red-950/30 focus-visible:ring-2 focus-visible:ring-[#06B6D4]/50"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Log out
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Center: brand (hidden on mobile) ── */}
        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none select-none hidden sm:flex items-center">
          <span
            className="text-lg font-normal tracking-[0.02em] text-[#1C1C1E] dark:text-white leading-none"
            style={{ fontFamily: "var(--font-cormorant-sc)" }}
            aria-hidden="true"
          >
            Bizify
          </span>
        </div>

        {/* ── Right: action buttons ── */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto flex-shrink-0">
          {/* Desktop: token usage + theme + notifications (hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-3">
            <TokenUsageWidget variant="header" />

            <NavButton
              onClick={toggleTheme}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? (
                <Sun
                  size={16}
                  className="text-[#8C8C8C] dark:text-neutral-400"
                  aria-hidden="true"
                />
              ) : (
                <Moon
                  size={16}
                  className="text-[#8C8C8C]"
                  aria-hidden="true"
                />
              )}
            </NavButton>

            <Popover>
              <PopoverTrigger asChild>
                <NavButton aria-label="Notifications">
                  <Bell
                    size={16}
                    className="text-[#8C8C8C] dark:text-neutral-400"
                    aria-hidden="true"
                  />
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
              {showMobileMenu ? (
                <X
                  size={16}
                  className="text-[#8C8C8C]"
                  aria-hidden="true"
                />
              ) : (
                <Menu
                  size={16}
                  className="text-[#8C8C8C]"
                  aria-hidden="true"
                />
              )}
            </NavButton>

            <AnimatePresence>
              {showMobileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMobileMenu(false)}
                    aria-hidden="true"
                  />
                  <motion.div
                    className="absolute top-full right-0 mt-2 bg-[#FAFAFA] dark:bg-neutral-800 border border-[#E9E9E9] dark:border-neutral-700 rounded-[14px] shadow-lg p-1 z-50 w-52"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    style={{ transformOrigin: "top right" }}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        toggleTheme();
                        setShowMobileMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#1C1C1E] dark:text-neutral-200 rounded-[10px] justify-start h-auto font-normal hover:bg-neutral-100 dark:hover:bg-neutral-700 focus-visible:ring-2 focus-visible:ring-[#06B6D4]/50"
                    >
                      {theme === "dark" ? (
                        <Sun
                          size={16}
                          className="text-[#8C8C8C] dark:text-neutral-400 shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <Moon
                          size={16}
                          className="text-[#8C8C8C] shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      {theme === "dark" ? "Light mode" : "Dark mode"}
                    </Button>
                    <Separator className="my-1 bg-[#E9E9E9] dark:bg-neutral-700" />
                    <div className="px-3 py-2">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#8C8C8C] dark:text-neutral-400 mb-2 flex items-center gap-2">
                        <Bell size={14} aria-hidden="true" />
                        Notifications
                      </p>
                      <p className="text-sm text-[#8C8C8C] dark:text-neutral-500">
                        No notifications yet.
                      </p>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      {/* Logout confirmation dialog */}
      {showLogoutConfirm && (
        <LogoutConfirmDialog
          onConfirm={() => {
            setShowLogoutConfirm(false);
            logout();
          }}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
}

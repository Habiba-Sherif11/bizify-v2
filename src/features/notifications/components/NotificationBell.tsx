"use client";

import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNotifications, type Notification } from "../hooks/useNotifications";

function isUnread(n: Notification) {
  if (typeof n.is_read === "boolean") return !n.is_read;
  return (n.status ?? "").toUpperCase() === "UNREAD";
}

function formatWhen(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.round(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    items,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    remove,
    clearAll,
  } = useNotifications();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Notifications"
        className="w-9 h-9 justify-center bg-white dark:bg-neutral-800 rounded-[10px] outline-[0.67px] outline-offset-[-0.67px] outline-black/10 dark:outline-white/10 flex items-center cursor-pointer"
      >
        <Bell size={16} className="text-gray-500 dark:text-gray-400" />
      </button>

      {unreadCount > 0 && (
        <div className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-amber-500 rounded-full flex items-center justify-center pointer-events-none">
          <span className="text-white text-[9px] font-bold leading-3">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        </div>
      )}

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              Notifications
            </p>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
                >
                  <CheckCheck size={14} />
                </button>
              )}
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  title="Clear all"
                  className="p-1.5 rounded-md text-neutral-500 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="w-5 h-5 mx-auto rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Bell size={24} className="mx-auto text-neutral-300 dark:text-neutral-600" />
                <p className="mt-2 text-sm text-neutral-500">No notifications yet</p>
              </div>
            ) : (
              <ul>
                {items.map((n) => {
                  const unread = isUnread(n);
                  return (
                    <li
                      key={n.id}
                      className={`group px-4 py-3 border-b border-neutral-100 dark:border-neutral-700/50 last:border-0 ${
                        unread ? "bg-amber-50/50 dark:bg-amber-950/10" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {unread && (
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          {n.title && (
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                              {n.title}
                            </p>
                          )}
                          <p className="text-sm text-neutral-600 dark:text-neutral-300 break-words">
                            {n.message}
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {formatWhen(n.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {unread && (
                            <button
                              type="button"
                              onClick={() => markAsRead(n.id)}
                              title="Mark as read"
                              className="p-1 rounded text-neutral-400 hover:text-emerald-600 cursor-pointer"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => remove(n.id)}
                            title="Delete"
                            className="p-1 rounded text-neutral-400 hover:text-red-600 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

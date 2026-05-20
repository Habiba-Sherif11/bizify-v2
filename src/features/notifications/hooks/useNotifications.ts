"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/features/auth/lib/api";

export type Notification = {
  id: string;
  title?: string;
  message: string;
  status?: "UNREAD" | "READ" | string;
  is_read?: boolean;
  created_at?: string;
  type?: string;
  link?: string | null;
};

type ListResponse =
  | Notification[]
  | { items?: Notification[]; data?: Notification[]; results?: Notification[] };

function extractList(raw: ListResponse): Notification[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    return raw.items ?? raw.data ?? raw.results ?? [];
  }
  return [];
}

export function isUnread(n: Notification) {
  if (typeof n.is_read === "boolean") return !n.is_read;
  return (n.status ?? "").toUpperCase() === "UNREAD";
}

// Fallback poll interval when SSE is unavailable
const FALLBACK_POLL_MS = 60_000;

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const fallbackRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<ListResponse>("/notifications");
      setItems(extractList(data));
      setError(null);
    } catch {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a single new notification (from SSE) without replacing the whole list
  const appendOrUpdate = useCallback((incoming: Notification) => {
    setItems((prev) => {
      const idx = prev.findIndex((n) => n.id === incoming.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = incoming;
        return next;
      }
      return [incoming, ...prev];
    });
  }, []);

  useEffect(() => {
    // Initial fetch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();

    // Try SSE — it proxies through our Next.js route which forwards the
    // auth cookie as a Bearer header automatically.
    if (typeof EventSource !== "undefined") {
      const es = new EventSource("/api/notifications/stream", { withCredentials: true });
      esRef.current = es;

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as Notification | { notifications?: Notification[] };
          if ("notifications" in payload && Array.isArray(payload.notifications)) {
            // Bulk update — replace list
            setItems(payload.notifications);
          } else if ("id" in payload) {
            appendOrUpdate(payload as Notification);
          }
        } catch {
          // malformed SSE chunk — ignore
        }
      };

      es.onerror = () => {
        // SSE failed (backend down, auth error, network) — close and fall back to polling
        es.close();
        esRef.current = null;
        if (!fallbackRef.current) {
          fallbackRef.current = setInterval(fetchAll, FALLBACK_POLL_MS);
        }
      };
    } else {
      // No EventSource support — poll
      fallbackRef.current = setInterval(fetchAll, FALLBACK_POLL_MS);
    }

    return () => {
      esRef.current?.close();
      esRef.current = null;
      if (fallbackRef.current) {
        clearInterval(fallbackRef.current);
        fallbackRef.current = null;
      }
    };
  }, [fetchAll, appendOrUpdate]);

  const markAsRead = useCallback(async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "READ", is_read: true } : n))
    );
    try {
      await api.patch(`/notifications/${id}/status`, { status: "READ" });
    } catch {
      fetchAll();
    }
  }, [fetchAll]);

  const markAllAsRead = useCallback(async () => {
    const unread = items.filter(isUnread).map((n) => n.id);
    if (unread.length === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, status: "READ", is_read: true })));
    try {
      await api.patch("/notifications/status/bulk", { ids: unread, status: "READ" });
    } catch {
      fetchAll();
    }
  }, [items, fetchAll]);

  const remove = useCallback(async (id: string) => {
    const snapshot = items;
    setItems((prev) => prev.filter((n) => n.id !== id));
    try {
      await api.delete(`/notifications/${id}`);
    } catch {
      setItems(snapshot);
    }
  }, [items]);

  const clearAll = useCallback(async () => {
    const snapshot = items;
    setItems([]);
    try {
      await api.delete("/notifications/status/all");
    } catch {
      setItems(snapshot);
    }
  }, [items]);

  const unreadCount = items.filter(isUnread).length;

  return {
    items,
    loading,
    error,
    unreadCount,
    refetch: fetchAll,
    markAsRead,
    markAllAsRead,
    remove,
    clearAll,
  };
}

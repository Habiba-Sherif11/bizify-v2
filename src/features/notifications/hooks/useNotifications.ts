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

function isUnread(n: Notification) {
  if (typeof n.is_read === "boolean") return !n.is_read;
  return (n.status ?? "").toUpperCase() === "UNREAD";
}

const POLL_MS = 60_000;

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => {
    fetchAll();
    intervalRef.current = setInterval(fetchAll, POLL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAll]);

  const markAsRead = useCallback(async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "READ", is_read: true } : n))
    );
    try {
      await api.patch(`/notifications/${id}/status`, { status: "READ" });
    } catch {
      // revert on failure
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

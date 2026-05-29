"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ShieldAlert,
  RefreshCw,
  Search,
  Clock,
  Globe,
} from "lucide-react";
import { api } from "@/features/auth/lib/api";
import { toast } from "sonner";

type SecurityLog = {
  id: string;
  user_id: string | null;
  event_type: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
};

type SeverityEntry = { label: string; cls: string; dot: string; badge: string };

const EVENT_SEVERITY: Record<string, SeverityEntry> = {
  FAIL:    { label: "HIGH RISK", cls: "bg-red-50 border-red-100",     dot: "bg-red-500",    badge: "bg-red-100 text-red-600" },
  BREACH:  { label: "HIGH RISK", cls: "bg-red-50 border-red-100",     dot: "bg-red-500",    badge: "bg-red-100 text-red-600" },
  HIGH:    { label: "HIGH RISK", cls: "bg-red-50 border-red-100",     dot: "bg-red-500",    badge: "bg-red-100 text-red-600" },
  BLOCK:   { label: "HIGH RISK", cls: "bg-red-50 border-red-100",     dot: "bg-red-500",    badge: "bg-red-100 text-red-600" },
  WARN:    { label: "MEDIUM",    cls: "bg-amber-50 border-amber-100", dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-700" },
  ANOMALY: { label: "MEDIUM",    cls: "bg-amber-50 border-amber-100", dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-700" },
  LOCK:    { label: "MEDIUM",    cls: "bg-amber-50 border-amber-100", dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-700" },
  DELAY:   { label: "MEDIUM",    cls: "bg-amber-50 border-amber-100", dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-700" },
};

function getSeverity(eventType: string): SeverityEntry {
  const upper = eventType.toUpperCase();
  for (const [key, val] of Object.entries(EVENT_SEVERITY)) {
    if (upper.includes(key)) return val;
  }
  return { label: "LOW", cls: "bg-white border-neutral-100", dot: "bg-neutral-300", badge: "bg-neutral-100 text-neutral-500" };
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hrs < 24) return `${hrs} hr ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function SecurityPage() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/security-logs");
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load security logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filtered = logs.filter((l) => {
    const sev = getSeverity(l.event_type).label;
    if (severityFilter === "HIGH" && !sev.includes("HIGH")) return false;
    if (severityFilter === "MEDIUM" && sev !== "MEDIUM") return false;
    if (severityFilter === "LOW" && sev !== "LOW") return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        l.event_type.toLowerCase().includes(q) ||
        (l.ip_address ?? "").includes(q) ||
        JSON.stringify(l.details ?? {}).toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    ALL: logs.length,
    HIGH: logs.filter((l) => getSeverity(l.event_type).label.includes("HIGH")).length,
    MEDIUM: logs.filter((l) => getSeverity(l.event_type).label === "MEDIUM").length,
    LOW: logs.filter((l) => getSeverity(l.event_type).label === "LOW").length,
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 h-14 flex items-center px-6 gap-4 sticky top-0 z-10">
        <ShieldAlert size={18} className="text-amber-500" />
        <div className="flex-1">
          <h1 className="text-base font-semibold text-neutral-900">Security Logs</h1>
          <p className="text-[11px] text-neutral-400">Monitor platform security events and alerts</p>
        </div>
        <button onClick={fetchLogs} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      <main className="p-6 max-w-[1200px] mx-auto space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total Events", count: counts.ALL, color: "text-neutral-900" },
            { label: "High Risk", count: counts.HIGH, color: "text-red-600" },
            { label: "Medium", count: counts.MEDIUM, color: "text-amber-600" },
            { label: "Low", count: counts.LOW, color: "text-neutral-500" },
          ].map(({ label, count, color }) => (
            <div key={label} className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
              <p className={`text-2xl font-bold tabular-nums ${color}`}>{count}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                severityFilter === s
                  ? "bg-amber-500 text-white"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {s === "ALL" ? "All" : s} ({counts[s === "ALL" ? "ALL" : s]})
            </button>
          ))}
          <div className="relative ml-auto">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              placeholder="Search event type or IP…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-400 w-56"
            />
          </div>
        </div>

        {/* Log list */}
        {loading ? (
          <div className="flex justify-center py-16 text-neutral-400">
            <RefreshCw size={20} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400">
            <ShieldAlert size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No security events found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((log) => {
              const sev = getSeverity(log.event_type);
              return (
                <div
                  key={log.id}
                  className={`bg-white rounded-xl border p-4 flex items-start gap-3 ${sev.cls}`}
                >
                  <div className="mt-1 shrink-0">
                    <span className={`w-2.5 h-2.5 rounded-full block ${sev.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {log.event_type.replace(/_/g, " ")}
                        </p>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                            {Object.entries(log.details)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${sev.badge}`}>
                        {sev.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-neutral-400">
                      {log.ip_address && (
                        <span className="flex items-center gap-1">
                          <Globe size={10} /> {log.ip_address}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {formatDate(log.created_at)}
                      </span>
                      <span className="ml-auto">{relTime(log.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

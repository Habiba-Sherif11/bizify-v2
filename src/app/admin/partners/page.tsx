"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Handshake,
  Clock,
  Search,
} from "lucide-react";
import { api } from "@/features/auth/lib/api";
import { toast } from "sonner";

type PartnerRequest = {
  id: string;
  user_id: string;
  partner_type: "MENTOR" | "SUPPLIER" | "MANUFACTURER";
  company_name: string | null;
  description: string | null;
  approval_status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  approved_at: string | null;
  linkedin_url: string | null;
};

const TYPE_COLORS: Record<string, string> = {
  MENTOR: "bg-blue-100 text-blue-700",
  SUPPLIER: "bg-purple-100 text-purple-700",
  MANUFACTURER: "bg-teal-100 text-teal-700",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-600",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

export default function PartnersPage() {
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter === "ALL" ? "/admin/requests" : `/admin/requests?status=${statusFilter}`;
      const { data } = await api.get(url);
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load partner requests");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id: string) => {
    setActionInProgress(id);
    try {
      await api.patch(`/admin/requests/${id}/approve`);
      toast.success("Partner application approved");
      fetchRequests();
    } catch {
      toast.error("Failed to approve");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionInProgress(id);
    try {
      await api.patch(`/admin/requests/${id}/reject`);
      toast.success("Partner application rejected");
      fetchRequests();
    } catch {
      toast.error("Failed to reject");
    } finally {
      setActionInProgress(null);
    }
  };

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (r.company_name ?? "").toLowerCase().includes(q) ||
      (r.description ?? "").toLowerCase().includes(q) ||
      r.partner_type.toLowerCase().includes(q)
    );
  });

  const counts = {
    ALL: requests.length,
    PENDING: requests.filter((r) => r.approval_status === "PENDING").length,
    APPROVED: requests.filter((r) => r.approval_status === "APPROVED").length,
    REJECTED: requests.filter((r) => r.approval_status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 h-14 flex items-center px-6 gap-4 sticky top-0 z-10">
        <Handshake size={18} className="text-amber-500" />
        <div className="flex-1">
          <h1 className="text-base font-semibold text-neutral-900">Partner Management</h1>
          <p className="text-[11px] text-neutral-400">Review and action partner applications</p>
        </div>
        <button onClick={fetchRequests} className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      <main className="p-6 max-w-[1200px] mx-auto space-y-4">
        {/* Status tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === s
                  ? "bg-amber-500 text-white"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()} ({counts[s]})
            </button>
          ))}
          <div className="relative ml-auto">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="flex justify-center py-16 text-neutral-400">
            <RefreshCw size={20} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400">
            <Handshake size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No partner applications found</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-neutral-900 truncate">
                      {r.company_name || "Unnamed Company"}
                    </p>
                    <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> Applied {formatDate(r.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_COLORS[r.partner_type] ?? "bg-neutral-100 text-neutral-600"}`}>
                      {r.partner_type.charAt(0) + r.partner_type.slice(1).toLowerCase()}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${STATUS_COLORS[r.approval_status]}`}>
                      {r.approval_status.charAt(0) + r.approval_status.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {r.description && (
                  <p className="text-xs text-neutral-600 line-clamp-2">{r.description}</p>
                )}

                {/* LinkedIn */}
                {r.linkedin_url && (
                  <a
                    href={r.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-500 hover:underline truncate block"
                  >
                    {r.linkedin_url}
                  </a>
                )}

                {/* Actions */}
                {r.approval_status === "PENDING" && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(r.id)}
                      disabled={actionInProgress === r.id}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg py-2 transition-colors disabled:opacity-40"
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(r.id)}
                      disabled={actionInProgress === r.id}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg py-2 transition-colors disabled:opacity-40"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                )}

                {r.approval_status === "APPROVED" && r.approved_at && (
                  <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Approved {formatDate(r.approved_at)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

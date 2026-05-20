"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  LogOut,
  Pencil,
  RefreshCw,
  X,
} from "lucide-react";
import { api } from "@/features/auth/lib/api";
import { useAuth } from "@/features/auth/context/AuthContext";
import { parseBackendError } from "@/lib/backend-error";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PartnerRole = "MENTOR" | "SUPPLIER" | "MANUFACTURER";

type PartnerProfile = {
  id: string;
  partner_type: PartnerRole;
  company_name?: string | null;
  description?: string | null;
  services_json?: unknown;
  experience_json?: unknown;
  approval_status: "PENDING" | "APPROVED" | "REJECTED";
  documents_json?: unknown;
};

type PartnerRequest = {
  id: string;
  entrepreneur_name?: string;
  entrepreneur_email?: string;
  message?: string;
  status?: string;
  created_at?: string;
};

function getErr(err: unknown, fallback: string) {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  return data ? parseBackendError(data) : fallback;
}

function parseTags(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return [raw].filter(Boolean);
    }
  }
  if (typeof raw === "object") {
    return Object.values(raw as Record<string, unknown>).map(String).filter(Boolean);
  }
  return [];
}

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const upper = status.toUpperCase();
  const styles =
    upper === "APPROVED"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
      : upper === "REJECTED"
        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  const icon =
    upper === "APPROVED" ? (
      <CheckCircle2 size={12} />
    ) : upper === "REJECTED" ? (
      <X size={12} />
    ) : (
      <Clock size={12} />
    );
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${styles}`}>
      {icon}
      {upper === "APPROVED" ? "Approved" : upper === "REJECTED" ? "Rejected" : "Pending review"}
    </span>
  );
}

function EditProfileModal({
  profile,
  onClose,
  onSave,
}: {
  profile: PartnerProfile;
  onClose: () => void;
  onSave: (updates: Partial<PartnerProfile>) => Promise<void>;
}) {
  const [companyName, setCompanyName] = useState(profile.company_name ?? "");
  const [description, setDescription] = useState(profile.description ?? "");
  const [services, setServices] = useState(parseTags(profile.services_json).join(", "));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        company_name: companyName.trim() || undefined,
        description: description.trim() || undefined,
        services_json: services
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Edit profile</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-neutral-400 hover:text-neutral-700 cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto space-y-4">
          <Field label="Company / display name">
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter your company or display name"
              className="w-full h-10 px-3.5 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200 text-sm outline-none focus:border-amber-400 transition-colors"
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your services and expertise"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200 text-sm outline-none focus:border-amber-400 transition-colors resize-none"
            />
          </Field>
          <Field label="Services (comma-separated)">
            <input
              type="text"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              placeholder="e.g. Manufacturing, Assembly, Quality control"
              className="w-full h-10 px-3.5 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200 text-sm outline-none focus:border-amber-400 transition-colors"
            />
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-yellow-500 disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-700 dark:text-gray-300">{label}</label>
      {children}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

const ROLE_LABELS: Record<PartnerRole, { title: string; color: string }> = {
  MENTOR:        { title: "Mentor",        color: "from-amber-500 to-yellow-500" },
  SUPPLIER:      { title: "Supplier",      color: "from-cyan-500 to-cyan-600" },
  MANUFACTURER:  { title: "Manufacturer",  color: "from-indigo-500 to-indigo-600" },
};

export function PartnerDashboard({ role }: { role: PartnerRole }) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const { title, color } = ROLE_LABELS[role];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<PartnerProfile>("/users/partner-profile");
      setProfile(data);

      if (data?.id) {
        setLoadingRequests(true);
        try {
          const reqRes = await api.get<PartnerRequest[]>(
            `/marketplace/partners/${data.id}/requests`
          );
          setRequests(Array.isArray(reqRes.data) ? reqRes.data : []);
        } catch {
          // non-fatal — might just be no requests yet
        } finally {
          setLoadingRequests(false);
        }
      }
    } catch (err) {
      toast.error(getErr(err, "Failed to load your profile"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleSaveProfile = async (updates: Partial<PartnerProfile>) => {
    try {
      const { data } = await api.patch<PartnerProfile>("/users/partner-profile", updates);
      setProfile(data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getErr(err, "Failed to update profile"));
      throw err;
    }
  };

  const initials = (user?.name || user?.email || "P")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}
            >
              <span className="text-white text-xs font-semibold">{initials}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {user?.name || user?.email?.split("@")[0] || title}
              </p>
              <p className="text-xs text-neutral-500">{title} Dashboard</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile card */}
        <section className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}
              >
                <Building2 size={24} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                    {profile?.company_name || user?.name || user?.email?.split("@")[0] || "Your Profile"}
                  </h2>
                  {profile?.approval_status && (
                    <StatusBadge status={profile.approval_status} />
                  )}
                </div>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {user?.email} · {title}
                </p>
                {profile?.description && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2 max-w-xl leading-relaxed">
                    {profile.description}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer shrink-0"
            >
              <Pencil size={14} />
              Edit profile
            </button>
          </div>

          {/* Services tags */}
          {parseTags(profile?.services_json).length > 0 && (
            <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-700">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                Services
              </p>
              <div className="flex flex-wrap gap-2">
                {parseTags(profile?.services_json).map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-700 text-sm text-neutral-700 dark:text-neutral-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Collaboration requests */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Collaboration requests
              </h2>
              <p className="text-sm text-neutral-500 mt-0.5">
                Entrepreneurs who want to work with you.
              </p>
            </div>
            <button
              type="button"
              onClick={load}
              className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 cursor-pointer"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          </div>

          {loadingRequests ? (
            <div className="flex justify-center py-12">
              <div className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 py-14 text-center">
              <ExternalLink
                size={28}
                className="mx-auto text-neutral-300 dark:text-neutral-600 mb-3"
              />
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                No requests yet
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Entrepreneurs discover you via the marketplace and send requests here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {req.entrepreneur_name || req.entrepreneur_email || "Entrepreneur"}
                        </p>
                        {req.status && (
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              req.status.toUpperCase() === "ACCEPTED"
                                ? "bg-emerald-100 text-emerald-700"
                                : req.status.toUpperCase() === "REJECTED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {req.status}
                          </span>
                        )}
                      </div>
                      {req.entrepreneur_email && req.entrepreneur_name && (
                        <p className="text-xs text-neutral-400 mt-0.5">{req.entrepreneur_email}</p>
                      )}
                      {req.message && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed">
                          {req.message}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-neutral-400">{formatDate(req.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {showEdit && profile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}

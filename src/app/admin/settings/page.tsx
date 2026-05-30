"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Settings,
  RefreshCw,
  Shield,
  Clock,
  Users,
  Handshake,
  CheckCircle2,
  XCircle,
  Info,
  Download,
  Server,
  Lock,
  Mail,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { api } from "@/features/auth/lib/api";
import { useAuth } from "@/features/auth/context/AuthContext";
import { toast } from "sonner";

type PlatformConfig = {
  session_timeout_minutes: number;
  jwt_expire_minutes: number;
  environment: string;
  debug_mode: boolean;
  allow_registration: boolean;
  require_email_verification: boolean;
  max_login_attempts: number;
  backend_version: string;
};

type Stats = {
  total_users: number;
  active_teams: number;
  registered_partners: number;
  suspended_users: number;
  total_ideas: number;
  system_health: number;
  system_status: string;
};

function SectionHeader({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-amber-600" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
        <p className="text-[11px] text-neutral-400">{description}</p>
      </div>
    </div>
  );
}

function ConfigRow({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
      <div>
        <p className="text-xs font-medium text-neutral-800">{label}</p>
        {note && <p className="text-[10px] text-neutral-400 mt-0.5">{note}</p>}
      </div>
      <div className="shrink-0 ml-4">{value}</div>
    </div>
  );
}

function BoolBadge({ value }: { value: boolean }) {
  return value ? (
    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
      <CheckCircle2 size={10} /> Enabled
    </span>
  ) : (
    <span className="flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
      <XCircle size={10} /> Disabled
    </span>
  );
}

function StatPill({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="text-center p-4 rounded-xl bg-neutral-50 border border-neutral-100">
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      <p className="text-[10px] text-neutral-400 mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchConfig = useCallback(async () => {
    setLoadingConfig(true);
    try {
      const { data } = await api.get("/admin/platform-config");
      setConfig(data);
    } catch {
      toast.error("Failed to load platform configuration");
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data);
    } catch {
      // Stats are secondary — don't block the page
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchConfig();
      fetchStats();
    }
  }, [fetchConfig, fetchStats, user]);

  const handleExport = async (type: "users" | "security-logs") => {
    try {
      const { data } = await api.get(
        type === "users" ? "/admin/users?limit=10000" : "/admin/security-logs"
      );
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bizify-${type}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${type} data`);
    } catch {
      toast.error("Export failed");
    }
  };

  const loading = loadingConfig && loadingStats;

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 h-14 flex items-center px-6 gap-4 sticky top-0 z-10">
        <Settings size={18} className="text-amber-500" />
        <div className="flex-1">
          <h1 className="text-base font-semibold text-neutral-900">System Settings</h1>
          <p className="text-[11px] text-neutral-400">Platform configuration and administration options</p>
        </div>
        <button
          onClick={() => { fetchConfig(); fetchStats(); }}
          className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      <main className="p-6 max-w-[900px] mx-auto space-y-5">

        {/* Platform Snapshot */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <SectionHeader icon={Activity} title="Platform Snapshot" description="Live counts from the database" />
          {loadingStats ? (
            <div className="flex justify-center py-8 text-neutral-400"><RefreshCw size={18} className="animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <StatPill label="Total Users" value={(stats?.total_users ?? 0).toLocaleString()} color="text-neutral-900" />
              <StatPill label="Active Teams" value={(stats?.active_teams ?? 0).toLocaleString()} color="text-blue-600" />
              <StatPill label="Partners" value={(stats?.registered_partners ?? 0).toLocaleString()} color="text-violet-600" />
              <StatPill label="Ideas" value={(stats?.total_ideas ?? 0).toLocaleString()} color="text-amber-600" />
              <StatPill label="Suspended" value={(stats?.suspended_users ?? 0).toLocaleString()} color="text-red-500" />
            </div>
          )}
        </div>

        {/* Security Configuration */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <SectionHeader icon={Shield} title="Security Configuration" description="Current security parameters enforced by the backend" />
          {loadingConfig ? (
            <div className="flex justify-center py-8 text-neutral-400"><RefreshCw size={18} className="animate-spin" /></div>
          ) : config ? (
            <div>
              <ConfigRow
                label="Session Timeout"
                value={<span className="text-xs font-semibold text-neutral-700 bg-neutral-100 rounded px-2 py-0.5">{config.session_timeout_minutes} min</span>}
                note="Inactive sessions are terminated after this duration"
              />
              <ConfigRow
                label="JWT Expiry"
                value={<span className="text-xs font-semibold text-neutral-700 bg-neutral-100 rounded px-2 py-0.5">{Math.round(config.jwt_expire_minutes / 60 / 24)} days</span>}
                note="Access tokens are valid for this duration"
              />
              <ConfigRow
                label="Max Failed Login Attempts"
                value={<span className="text-xs font-semibold text-neutral-700 bg-neutral-100 rounded px-2 py-0.5">{config.max_login_attempts} attempts</span>}
                note="Account is locked after this many consecutive failures"
              />
              <ConfigRow
                label="Email Verification Required"
                value={<BoolBadge value={config.require_email_verification} />}
                note="New users must verify their email before access"
              />
              <ConfigRow
                label="Debug Mode"
                value={<BoolBadge value={config.debug_mode} />}
                note="Verbose logging — should be off in production"
              />
            </div>
          ) : (
            <p className="text-xs text-neutral-400 text-center py-4">Could not load configuration</p>
          )}
        </div>

        {/* User Registration */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <SectionHeader icon={Users} title="User Registration" description="Controls who can join the platform" />
          {loadingConfig ? (
            <div className="flex justify-center py-8 text-neutral-400"><RefreshCw size={18} className="animate-spin" /></div>
          ) : config ? (
            <div>
              <ConfigRow
                label="Open Registration"
                value={<BoolBadge value={config.allow_registration} />}
                note="When enabled, anyone can sign up for a new account"
              />
              <ConfigRow
                label="Default Role"
                value={<span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Entrepreneur</span>}
                note="Role assigned to new users upon registration"
              />
              <ConfigRow
                label="Google OAuth"
                value={<BoolBadge value={true} />}
                note="Users can sign in with their Google account"
              />
            </div>
          ) : null}
        </div>

        {/* Partner Applications */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <SectionHeader icon={Handshake} title="Partner Applications" description="How partner requests are handled" />
          <div>
            <ConfigRow
              label="Auto-approval"
              value={<BoolBadge value={false} />}
              note="Partner applications require manual admin review"
            />
            <ConfigRow
              label="Supported Partner Types"
              value={
                <div className="flex gap-1.5">
                  {["Mentor", "Supplier", "Manufacturer"].map((t) => (
                    <span key={t} className="text-[10px] font-semibold bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              }
            />
            <ConfigRow
              label="LinkedIn URL Required"
              value={<BoolBadge value={true} />}
              note="Applicants must provide a LinkedIn profile URL"
            />
          </div>
        </div>

        {/* Admin Session */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <SectionHeader icon={Lock} title="Your Admin Session" description="Current session information" />
          <div>
            <ConfigRow
              label="Logged in as"
              value={<span className="text-xs font-semibold text-neutral-700">{user?.email}</span>}
            />
            <ConfigRow
              label="Role"
              value={<span className="text-[10px] font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase">Admin</span>}
            />
            <ConfigRow
              label="Environment"
              value={
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  config?.environment === "production"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {config?.environment ?? "production"}
                </span>
              }
            />
            {config && (
              <ConfigRow
                label="Backend Version"
                value={<span className="text-xs font-mono text-neutral-500">{config.backend_version}</span>}
              />
            )}
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <SectionHeader icon={Server} title="System Information" description="Platform and infrastructure details" />
          <div>
            <ConfigRow
              label="Database"
              value={<span className="text-xs text-neutral-600">PostgreSQL (Supabase)</span>}
            />
            <ConfigRow
              label="Authentication"
              value={<span className="text-xs text-neutral-600">JWT + Google OAuth 2.0</span>}
            />
            <ConfigRow
              label="AI Provider"
              value={<span className="text-xs text-neutral-600">Groq (LLaMA / Mixtral)</span>}
            />
            <ConfigRow
              label="Email"
              value={<span className="text-xs text-neutral-600">SMTP (configured via env)</span>}
            />
            <ConfigRow
              label="System Health"
              value={
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  {stats?.system_status === "online" ? "Operational" : "Degraded"} · {stats?.system_health ?? 99.8}%
                </span>
              }
            />
          </div>
        </div>

        {/* Notifications placeholder */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <SectionHeader icon={Mail} title="Notification Settings" description="Configure admin alert preferences" />
          <div>
            <ConfigRow
              label="Security event alerts"
              value={<BoolBadge value={true} />}
              note="Email alert on HIGH severity security events"
            />
            <ConfigRow
              label="New user registration alerts"
              value={<BoolBadge value={false} />}
              note="Email alert when a new user registers"
            />
            <ConfigRow
              label="Partner application alerts"
              value={<BoolBadge value={true} />}
              note="Email alert when a partner application is submitted"
            />
          </div>
          <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-3">
            <Info size={13} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700">Notification preferences are managed via environment variables. Contact your infrastructure team to change these settings.</p>
          </div>
        </div>

        {/* Data Export */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <SectionHeader icon={Download} title="Data Export" description="Download platform data as JSON" />
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleExport("users")}
              className="flex items-center gap-2 text-xs font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg px-4 py-2.5 transition-colors"
            >
              <Users size={13} /> Export Users
            </button>
            <button
              onClick={() => handleExport("security-logs")}
              className="flex items-center gap-2 text-xs font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg px-4 py-2.5 transition-colors"
            >
              <Shield size={13} /> Export Security Logs
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-xl border border-red-100 p-5">
          <SectionHeader icon={AlertTriangle} title="Danger Zone" description="Irreversible administrative actions" />
          <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-lg p-4">
            <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-700">Destructive Actions</p>
              <p className="text-[10px] text-red-500 mt-0.5">
                Bulk delete, data purge, and system reset operations are available only via direct database access or CLI to prevent accidental execution.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

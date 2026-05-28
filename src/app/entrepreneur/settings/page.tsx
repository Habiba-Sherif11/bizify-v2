"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/features/auth/lib/api";
import { parseBackendError } from "@/lib/backend-error";
import { useAuth } from "@/features/auth/context/AuthContext";

type NotificationSettings = {
  is_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
};

type PrivacySettings = {
  visibility: "public" | "private" | string;
  show_contact_info: boolean;
};

type SettingsResponse = {
  email?: string;
  is_active?: boolean;
  last_password_change?: string;
  full_name?: string;
  bio?: string;
  interests?: string[];
  notifications?: NotificationSettings;
  privacy?: PrivacySettings;
  profile?: {
    full_name?: string;
    bio?: string;
    interests?: string[];
  };
};

type ProfileState = {
  full_name: string;
  bio: string;
  interests: string;
};

type AccountInfo = {
  email: string;
  is_active: boolean;
  last_password_change?: string;
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  is_enabled: true,
  email_enabled: true,
  push_enabled: true,
};

const DEFAULT_PRIVACY: PrivacySettings = {
  visibility: "public",
  show_contact_info: true,
};

const VISIBILITY_OPTIONS = ["public", "private"] as const;

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function parseInterests(input: string) {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getErrorMessage(error: unknown, fallback: string) {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  return data ? parseBackendError(data) : fallback;
}

function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`w-11 h-6 rounded-full transition-colors relative ${
        enabled ? "bg-amber-500" : "bg-slate-200 dark:bg-neutral-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [profile, setProfile] = useState<ProfileState>({
    full_name: user?.name ?? "",
    bio: "",
    interests: "",
  });
  const [notifications, setNotifications] =
    useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY);
  const [password, setPassword] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get<SettingsResponse>("/settings")
      .then(({ data }) => {
        if (!active) return;
        const profileSource = data.profile ?? data;
        const rawInterests =
          profileSource.interests ??
          data.interests ??
          [];
        const interests = Array.isArray(rawInterests)
          ? rawInterests.map(String).filter(Boolean).join(", ")
          : "";
        const visibility =
          VISIBILITY_OPTIONS.includes(
            (data.privacy?.visibility ?? DEFAULT_PRIVACY.visibility) as
              (typeof VISIBILITY_OPTIONS)[number]
          )
            ? (data.privacy?.visibility ?? DEFAULT_PRIVACY.visibility)
            : DEFAULT_PRIVACY.visibility;

        setAccount({
          email: data.email ?? "",
          is_active: data.is_active ?? true,
          last_password_change: data.last_password_change,
        });
        setProfile({
          // Prefer settings response, fall back to AuthContext user name
          full_name: profileSource.full_name ?? data.full_name ?? user?.name ?? "",
          bio: profileSource.bio ?? "",
          interests,
        });
        setNotifications({
          is_enabled: data.notifications?.is_enabled ?? DEFAULT_NOTIFICATIONS.is_enabled,
          email_enabled: data.notifications?.email_enabled ?? DEFAULT_NOTIFICATIONS.email_enabled,
          push_enabled: data.notifications?.push_enabled ?? DEFAULT_NOTIFICATIONS.push_enabled,
        });
        setPrivacy({
          visibility,
          show_contact_info:
            data.privacy?.show_contact_info ?? DEFAULT_PRIVACY.show_contact_info,
        });
      })
      .catch((err) => {
        if (!active) return;
        toast.error(getErrorMessage(err, "Failed to load settings"));
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSaveProfile = async () => {
    if (savingProfile) return;
    setSavingProfile(true);
    const payload = {
      full_name: profile.full_name.trim(),
      bio: profile.bio.trim(),
      interests: parseInterests(profile.interests),
    };
    try {
      await api.patch("/settings/profile", payload);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (savingNotifications) return;
    setSavingNotifications(true);
    try {
      const { data } = await api.patch<NotificationSettings>(
        "/settings/notifications",
        notifications
      );
      setNotifications({
        is_enabled: data?.is_enabled ?? notifications.is_enabled,
        email_enabled: data?.email_enabled ?? notifications.email_enabled,
        push_enabled: data?.push_enabled ?? notifications.push_enabled,
      });
      toast.success("Notification settings updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update notifications"));
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleSavePrivacy = async () => {
    if (savingPrivacy) return;
    setSavingPrivacy(true);
    try {
      const { data } = await api.patch<PrivacySettings>("/settings/privacy", privacy);
      setPrivacy({
        visibility: data?.visibility ?? privacy.visibility,
        show_contact_info: data?.show_contact_info ?? privacy.show_contact_info,
      });
      toast.success("Privacy settings updated");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update privacy"));
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleChangePassword = async () => {
    if (savingPassword) return;
    if (!password.current_password || !password.new_password || !password.confirm_password) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (password.new_password !== password.confirm_password) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await api.patch("/settings/password", password);
      // Password change invalidates ALL tokens on all devices (handoff Warning 16).
      // Log out immediately so the expired token isn't used for any further requests.
      toast.success("Password updated. Please log in again.");
      await logout();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update password"));
      setSavingPassword(false);
    }
  };

  const handleDeactivate = async () => {
    if (deactivating) return;
    setDeactivating(true);
    try {
      await api.post("/settings/deactivate");
      toast.success("Account deactivated");
      await logout();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to deactivate account"));
    } finally {
      setDeactivating(false);
      setShowDeactivateConfirm(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await api.delete("/settings");
      toast.success("Account deleted");
      await logout();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete account"));
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 transition-colors">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <nav className="flex items-center gap-1.5 pt-6 text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/entrepreneur"
            className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <Home size={14} />
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-gray-700 dark:text-gray-200 font-medium">Settings</span>
        </nav>

        <div className="mt-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your profile, notifications, privacy, and security.
          </p>
        </div>

        <div className="mt-6 grid gap-6">
          <section className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Account
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your account status and login details.
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  account?.is_active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {account?.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-gray-300">
                  Email
                </label>
                <div className="mt-1 h-10 px-3.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/30 text-sm text-gray-700 dark:text-gray-200 flex items-center">
                  {account?.email || "—"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-gray-300">
                  Last password change
                </label>
                <div className="mt-1 h-10 px-3.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900/30 text-sm text-gray-700 dark:text-gray-200 flex items-center">
                  {formatDate(account?.last_password_change)}
                </div>
              </div>
            </div>
          </section>

          <section
            id="profile"
            className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Profile
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Update your public name, bio, and interests.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_16px_rgba(255,183,3,0.4)] disabled:opacity-50 cursor-pointer"
              >
                {savingProfile ? "Saving…" : "Save changes"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-gray-300">
                  Full name
                </label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile((prev) => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="h-10 px-3.5 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200 text-sm outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-gray-300">
                  Interests (comma-separated)
                </label>
                <input
                  type="text"
                  value={profile.interests}
                  onChange={(e) => setProfile((prev) => ({ ...prev, interests: e.target.value }))}
                  placeholder="E.g. Fintech, Marketing, AI"
                  className="h-10 px-3.5 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200 text-sm outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-gray-300">
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us a little about you"
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200 text-sm outline-none focus:border-amber-400 transition-colors resize-none"
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Notifications
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose how you want to receive updates.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveNotifications}
                disabled={savingNotifications}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_16px_rgba(255,183,3,0.4)] disabled:opacity-50 cursor-pointer"
              >
                {savingNotifications ? "Saving…" : "Save changes"}
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    Notifications
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Master switch for all notification channels.
                  </p>
                </div>
                <Toggle
                  enabled={notifications.is_enabled}
                  onChange={(next) =>
                    setNotifications((prev) => ({ ...prev, is_enabled: next }))
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    Email notifications
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Receive updates and reminders via email.
                  </p>
                </div>
                <Toggle
                  enabled={notifications.email_enabled}
                  onChange={(next) =>
                    setNotifications((prev) => ({ ...prev, email_enabled: next }))
                  }
                  disabled={!notifications.is_enabled}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    Push notifications
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get real-time alerts on supported devices.
                  </p>
                </div>
                <Toggle
                  enabled={notifications.push_enabled}
                  onChange={(next) =>
                    setNotifications((prev) => ({ ...prev, push_enabled: next }))
                  }
                  disabled={!notifications.is_enabled}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Privacy
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Control what others can see about you.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSavePrivacy}
                disabled={savingPrivacy}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_16px_rgba(255,183,3,0.4)] disabled:opacity-50 cursor-pointer"
              >
                {savingPrivacy ? "Saving…" : "Save changes"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-gray-300">
                  Profile visibility
                </label>
                <select
                  value={privacy.visibility}
                  onChange={(e) =>
                    setPrivacy((prev) => ({ ...prev, visibility: e.target.value }))
                  }
                  className="h-10 px-3.5 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200 text-sm outline-none focus:border-amber-400 transition-colors"
                >
                  {VISIBILITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-dashed border-neutral-200 dark:border-neutral-700 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    Show contact info
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Allow others to view your contact details.
                  </p>
                </div>
                <Toggle
                  enabled={privacy.show_contact_info}
                  onChange={(next) =>
                    setPrivacy((prev) => ({ ...prev, show_contact_info: next }))
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Security
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Change your password and keep your account secure.
                </p>
              </div>
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={savingPassword}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-linear-to-r from-amber-500 to-yellow-500 shadow-[0_2px_16px_rgba(255,183,3,0.4)] disabled:opacity-50 cursor-pointer"
              >
                {savingPassword ? "Saving…" : "Update password"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-gray-300">
                  Current password
                </label>
                <input
                  type="password"
                  value={password.current_password}
                  onChange={(e) =>
                    setPassword((prev) => ({ ...prev, current_password: e.target.value }))
                  }
                  className="h-10 px-3.5 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200 text-sm outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-gray-300">
                  New password
                </label>
                <input
                  type="password"
                  value={password.new_password}
                  onChange={(e) =>
                    setPassword((prev) => ({ ...prev, new_password: e.target.value }))
                  }
                  className="h-10 px-3.5 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200 text-sm outline-none focus:border-amber-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700 dark:text-gray-300">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={password.confirm_password}
                  onChange={(e) =>
                    setPassword((prev) => ({ ...prev, confirm_password: e.target.value }))
                  }
                  className="h-10 px-3.5 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200 text-sm outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-700 dark:text-red-400 mt-0.5" />
              <div>
                <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
                  Danger zone
                </h2>
                <p className="text-sm text-red-600/90 dark:text-red-300">
                  Deactivate or permanently delete your account.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {!showDeactivateConfirm ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Deactivate account
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Your account will be disabled until reactivated by support.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeactivateConfirm(true)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-red-700 bg-white border border-red-200 hover:bg-red-100 dark:bg-neutral-900/50 dark:text-red-300 dark:border-red-900 cursor-pointer"
                  >
                    Deactivate
                  </button>
                </div>
              ) : (
                <div className="rounded-lg border border-red-200 dark:border-red-900 p-4 bg-white/70 dark:bg-neutral-900/50">
                  <p className="text-sm text-neutral-900 dark:text-white font-medium">
                    Deactivate your account now?
                  </p>
                  <div className="mt-3 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDeactivateConfirm(false)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeactivate}
                      disabled={deactivating}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                    >
                      {deactivating ? "Deactivating…" : "Confirm deactivate"}
                    </button>
                  </div>
                </div>
              )}

              {!showDeleteConfirm ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Delete account
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      This will permanently erase your account and data.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div className="rounded-lg border border-red-200 dark:border-red-900 p-4 bg-white/70 dark:bg-neutral-900/50">
                  <p className="text-sm text-neutral-900 dark:text-white font-medium">
                    Permanently delete your account?
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    This action cannot be undone.
                  </p>
                  <div className="mt-3 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 cursor-pointer"
                    >
                      {deleting ? "Deleting…" : "Confirm delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

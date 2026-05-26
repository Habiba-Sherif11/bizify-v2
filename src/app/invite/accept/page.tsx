"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { api } from "@/features/auth/lib/api";
import SVGComponent from "@/components/sections/logo";

type Status = "loading" | "accepting" | "success" | "error" | "unauthenticated" | "no_token";

function InviteAcceptContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("no_token");
      return;
    }
    if (authLoading) return;

    if (!user) {
      setStatus("unauthenticated");
      return;
    }

    // User is authenticated — accept the invite automatically
    setStatus("accepting");
    api
      .post(`/groups/invites/accept?token=${encodeURIComponent(token)}`)
      .then(() => {
        setStatus("success");
        // Redirect to teams after a short delay so the user sees the success message
        setTimeout(() => router.push("/entrepreneur/team"), 2500);
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          "Failed to accept the invitation. The link may be expired or already used.";
        setErrorMsg(msg);
        setStatus("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, authLoading, user]);

  const inviteUrl = token
    ? `/invite/accept?token=${encodeURIComponent(token)}`
    : "/invite/accept";

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10">
        <SVGComponent className="h-7 w-auto" />
        <span
          className="text-lg font-semibold text-neutral-900 dark:text-white"
          style={{ fontFamily: "var(--font-cormorant-sc)" }}
        >
          Bizify
        </span>
      </Link>

      <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-8 flex flex-col items-center text-center gap-6">
        {/* Loading auth */}
        {(status === "loading" || status === "accepting") && (
          <>
            <div className="w-16 h-16 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
              <Loader2 size={32} className="text-cyan-500 animate-spin" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                {status === "accepting" ? "Accepting invitation…" : "Loading…"}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {status === "accepting"
                  ? "Adding you to the team, please wait."
                  : "Verifying your session…"}
              </p>
            </div>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                You&rsquo;re in!
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You&rsquo;ve successfully joined the team. Redirecting you to your teams…
              </p>
            </div>
            <Link
              href="/entrepreneur/team"
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-yellow-500 shadow-[0_2px_14px_rgba(255,183,3,0.4)] transition-opacity hover:opacity-90"
            >
              Go to Teams
            </Link>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle size={32} className="text-red-500" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                Invitation Failed
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{errorMsg}</p>
            </div>
            <Link
              href="/entrepreneur/team"
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-yellow-500 shadow-[0_2px_14px_rgba(255,183,3,0.4)] transition-opacity hover:opacity-90"
            >
              Go to My Teams
            </Link>
          </>
        )}

        {/* No token */}
        {status === "no_token" && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
              <XCircle size={32} className="text-amber-500" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                Invalid Invitation Link
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This invitation link is missing a token. Please check your email and click the
                original link.
              </p>
            </div>
            <Link
              href="/"
              className="w-full py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              Back to Home
            </Link>
          </>
        )}

        {/* Unauthenticated */}
        {status === "unauthenticated" && (
          <>
            <div className="w-16 h-16 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
              <Users size={32} className="text-cyan-500" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">
                You&rsquo;ve Been Invited!
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You need a Bizify account to accept this team invitation. Log in to join, or create a
                free account first.
              </p>
            </div>

            <div className="w-full flex flex-col gap-3">
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(inviteUrl)}`}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-yellow-500 shadow-[0_2px_14px_rgba(255,183,3,0.4)] transition-opacity hover:opacity-90 text-center"
              >
                Log In to Accept
              </Link>
              <Link
                href="/signup"
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-200 border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-center"
              >
                Create an Account
              </Link>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500">
              After signing up, return to this invitation link to join the team.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
          <Loader2 size={32} className="text-cyan-500 animate-spin" />
        </div>
      }
    >
      <InviteAcceptContent />
    </Suspense>
  );
}

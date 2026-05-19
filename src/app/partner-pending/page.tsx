"use client";

import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Clock, LogOut, Mail, CheckCircle, XCircle } from "lucide-react";

export default function PartnerPendingPage() {
  const { user, logout } = useAuth();

  const isRejected = user?.approval_status === "REJECTED";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          {isRejected ? (
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          )}
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            {isRejected ? "Application Not Approved" : "Application Under Review"}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            {isRejected
              ? "Unfortunately, your partner application was not approved. Please contact our support team for more information."
              : "Thank you for registering! Our team is reviewing your application and supporting documents. You'll receive an email once a decision has been made."}
          </p>
        </div>

        {/* User info */}
        {user?.email && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-2.5">
            <Mail className="w-4 h-4 shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
        )}

        {/* Status badge */}
        {!isRejected && (
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5">
            <CheckCircle className="w-4 h-4" />
            Awaiting approval
          </div>
        )}

        {/* What happens next */}
        {!isRejected && (
          <div className="text-left space-y-3 border-t border-gray-100 pt-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">What happens next</p>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="font-semibold text-cyan-600 shrink-0">1.</span>
                Our team reviews your documents (typically 1–3 business days)
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-cyan-600 shrink-0">2.</span>
                You'll receive an email notification with the decision
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-cyan-600 shrink-0">3.</span>
                Once approved, log in again to access your partner dashboard
              </li>
            </ol>
          </div>
        )}

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

const PARTNER_ROLES = new Set(["manufacturer", "mentor", "supplier"]);

function resolveRedirect(role: string, approvalStatus?: string): string {
  const r = role.toLowerCase();
  if (r === "entrepreneur") return "/entrepreneur";
  if (PARTNER_ROLES.has(r)) {
    return approvalStatus === "APPROVED" ? `/${r}` : "/partner-pending";
  }
  return "/dashboard";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=google_no_code", BASE));
  }

  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
      { code },
      { timeout: 30_000 }
    );

    const access_token: unknown = data.access_token;

    if (!access_token || typeof access_token !== "string") {
      console.error("[Google Callback] No access_token in response:", data);
      return NextResponse.redirect(new URL("/login?error=google_failed", BASE));
    }

    // Determine where to send the user based on their role and approval status
    let redirectPath = "/dashboard";
    try {
      const { data: userData } = await axios.get(
        `${process.env.BACKEND_URL}/api/v1/users/me`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
          timeout: 10_000,
        }
      );
      const role = (userData.role ?? userData.user?.role ?? "") as string;
      const approvalStatus = (userData.approval_status ?? userData.user?.approval_status) as
        | string
        | undefined;
      redirectPath = resolveRedirect(role, approvalStatus);
    } catch {
      // Role fetch failed — fall back to /dashboard
    }

    const response = NextResponse.redirect(new URL(redirectPath, BASE));
    response.cookies.set("auth_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err: unknown) {
    const e = err as { response?: { status?: number; data?: unknown } };
    console.error("[Google Callback] Backend error:", e.response?.status, e.response?.data);
    return NextResponse.redirect(new URL("/login?error=google_failed", BASE));
  }
}

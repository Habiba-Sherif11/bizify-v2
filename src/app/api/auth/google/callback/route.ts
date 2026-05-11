import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

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

    const response = NextResponse.redirect(new URL("/dashboard", BASE));
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

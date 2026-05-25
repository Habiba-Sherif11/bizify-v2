import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  // Use the request's own origin so this works on localhost, Vercel preview,
  // and production without any env-var coordination.
  const origin = request.nextUrl.origin;

  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/auth/google/url`,
      { timeout: 15_000 }
    );

    // Backend may return the URL under various keys — try the most common ones
    const url: unknown =
      data.url ?? data.authorization_url ?? data.auth_url ?? Object.values(data as object)[0];

    if (!url || typeof url !== "string") {
      console.error("[Google OAuth] Unexpected response from backend:", data);
      return NextResponse.redirect(new URL("/login?error=google_unavailable", origin));
    }

    return NextResponse.redirect(url);
  } catch (err: unknown) {
    const e = err as { response?: { status?: number; data?: unknown } };
    console.error("[Google OAuth] Failed to get auth URL:", e.response?.status, e.response?.data);
    return NextResponse.redirect(new URL("/login?error=google_unavailable", origin));
  }
}

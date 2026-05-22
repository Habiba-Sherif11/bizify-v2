import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";

export async function POST(request: NextRequest) {
  let body: { email?: string; otp_code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, otp_code } = body;

  if (!email || !otp_code) {
    return NextResponse.json({ error: "Missing email or otp_code" }, { status: 400 });
  }

  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/auth/verify-otp`,
      { email, otp_code },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 65_000,
      }
    );

    const response = NextResponse.json({ success: true });

    // Backend returns an access_token on successful OTP verification
    const { access_token } = data ?? {};
    if (access_token) {
      response.cookies.set("auth_token", access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }

    return response;
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "OTP verification failed");

    if (process.env.NODE_ENV === "development") {
      const e = error as { response?: { status?: number; data?: unknown } };
      console.error("[Verify OTP] Backend error:", e.response?.status, e.response?.data);
    }

    return NextResponse.json({ error: message }, { status });
  }
}

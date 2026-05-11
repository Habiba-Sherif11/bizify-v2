import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";

export async function POST(request: NextRequest) {
  let body: { email?: string; otp_code?: string; new_password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, otp_code, new_password } = body;

  if (!email || !otp_code || !new_password) {
    return NextResponse.json(
      { error: "Missing required fields: email, otp_code, new_password" },
      { status: 400 }
    );
  }

  try {
    await axios.post(
      `${process.env.BACKEND_URL}/api/v1/auth/reset-password`,
      null,
      {
        params: { email, otp_code, new_password },
        timeout: 65_000,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Reset failed");

    if (process.env.NODE_ENV === "development") {
      const e = error as { response?: { status?: number; data?: unknown } };
      console.error("[Reset Password] Backend error:", e.response?.status, e.response?.data);
    }

    return NextResponse.json({ error: message }, { status });
  }
}

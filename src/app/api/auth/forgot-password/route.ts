import { NextResponse, NextRequest } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    await axios.post(
      `${process.env.BACKEND_URL}/api/v1/auth/forgot-password`,
      null,
      { params: { email }, timeout: 65_000 }
    );

    return NextResponse.json({
      message: "If the email exists, a reset code has been sent.",
    });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Request failed");

    if (process.env.NODE_ENV === "development") {
      const e = error as { response?: { status?: number; data?: unknown } };
      console.error("[Forgot Password] Backend error:", e.response?.status, e.response?.data);
    }

    return NextResponse.json({ error: message }, { status });
  }
}

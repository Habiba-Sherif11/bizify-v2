import { NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";

const BACKEND_TIMEOUT = 35_000;

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("username", email);
    params.append("password", password);

    const res = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/auth/login`,
      params,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: BACKEND_TIMEOUT,
      }
    );

    const { access_token } = res.data;

    if (!access_token) {
      return NextResponse.json(
        { error: "Invalid login response from server" },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("auth_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Invalid credentials");

    if (process.env.NODE_ENV === "development") {
      const e = error as { response?: { status?: number; data?: unknown } };
      console.error("[Login] Backend error:", e.response?.status, e.response?.data);
    }

    return NextResponse.json({ error: message }, { status: status === 503 ? 503 : 401 });
  }
}

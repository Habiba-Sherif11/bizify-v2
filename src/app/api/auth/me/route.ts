import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const headers = { Authorization: `Bearer ${token}` };

  // Try /users/me first, fall back to /auth/session-status
  const attempts = [
    `${process.env.BACKEND_URL}/api/v1/users/me`,
    `${process.env.BACKEND_URL}/api/v1/auth/session-status`,
  ];

  for (const url of attempts) {
    try {
      const { data } = await axios.get(url, { headers, timeout: 65_000 });

      console.log(`[/api/auth/me] Success from ${url}:`, JSON.stringify(data));

      const user = {
        email: data.email || data.username || data.user?.email || "",
        role: data.role || data.user?.role || "entrepreneur",
        name: data.full_name || data.name || data.username || data.user?.full_name || "",
      };

      return NextResponse.json({ user });
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: unknown }; code?: string };
      console.error(
        `[/api/auth/me] Failed ${url}:`,
        e.response?.status ?? e.code,
        JSON.stringify(e.response?.data)
      );
      // continue to next attempt
    }
  }

  // All attempts failed — return null so frontend shows "session expired"
  return NextResponse.json({ user: null });
}

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { data } = await axios.patch(
      `${process.env.BACKEND_URL}/api/v1/users/me`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 65_000,
      }
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Update failed");
    return NextResponse.json({ error: message }, { status });
  }
}

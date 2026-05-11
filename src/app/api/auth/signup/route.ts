import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

const BACKEND_TIMEOUT = 65_000; // 65 s — Render free tier can take ~60 s to wake

function parseBackendMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object" || Array.isArray(data)) return fallback;

  const d = data as Record<string, unknown>;

  if (Array.isArray(d.detail)) {
    const first = d.detail[0] as Record<string, unknown> | undefined;
    return typeof first?.msg === "string" ? first.msg : fallback;
  }
  if (typeof d.detail === "string" && d.detail) return d.detail;
  if (typeof d.error === "string" && d.error) return d.error;
  if (typeof d.message === "string" && d.message) return d.message;

  return fallback;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { full_name, email, password, confirm_password } = body;

  if (!full_name || !email || !password) {
    return NextResponse.json(
      { error: "full_name, email, and password are required" },
      { status: 400 }
    );
  }

  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    console.error("[Signup] BACKEND_URL is not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  console.log(`[Signup] Calling backend: POST ${backendUrl}/api/v1/users/register`);

  try {
    const { data, status } = await axios.post(
      `${backendUrl}/api/v1/users/register`,
      { full_name, email, password, confirm_password },
      { timeout: BACKEND_TIMEOUT }
    );

    console.log("[Signup] Backend success:", status, data);
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const error = err as AxiosError;

    if (error.response) {
      // Backend replied with a non-2xx status
      console.error(
        "[Signup] Backend error:",
        error.response.status,
        JSON.stringify(error.response.data)
      );
      const message = parseBackendMessage(error.response.data, "Registration failed");
      return NextResponse.json({ error: message }, { status: error.response.status });
    }

    // No response — network / timeout
    const isTimeout = error.code === "ECONNABORTED" || error.message?.includes("timeout");
    console.error("[Signup] Network error:", error.code, error.message);

    return NextResponse.json(
      {
        error: isTimeout
          ? "The server took too long to respond. Please try again."
          : "Could not reach the server. Please check your connection.",
      },
      { status: 503 }
    );
  }
}

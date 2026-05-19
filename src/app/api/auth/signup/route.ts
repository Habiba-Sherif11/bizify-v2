import { NextResponse } from "next/server";

const BACKEND_TIMEOUT_MS = 65_000;

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

  console.log(`[Signup] POST ${backendUrl}/api/v1/users/register`);

  try {
    const res = await fetch(`${backendUrl}/api/v1/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name, email, password, confirm_password }),
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });

    const data: unknown = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("[Signup] Backend error:", res.status, data);
      const message = parseBackendMessage(data, "Registration failed");
      return NextResponse.json({ error: message }, { status: res.status });
    }

    console.log("[Signup] Backend success:", res.status);
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    console.error("[Signup] Fetch error:", isTimeout ? "timeout" : err);
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

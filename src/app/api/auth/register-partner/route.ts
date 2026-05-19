import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    console.error("[Register Partner] BACKEND_URL is not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  console.log(`[Register Partner] POST ${backendUrl}/api/v1/users/register-partner`);

  try {
    // Pass FormData directly — native fetch sets Content-Type with the correct boundary
    const res = await fetch(`${backendUrl}/api/v1/users/register-partner`, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });

    const data: unknown = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("[Register Partner] Backend error:", res.status, data);
      const message = parseBackendMessage(data, "Partner registration failed");
      return NextResponse.json({ error: message }, { status: res.status });
    }

    console.log("[Register Partner] Backend success:", res.status);
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    console.error("[Register Partner] Fetch error:", isTimeout ? "timeout" : err);
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

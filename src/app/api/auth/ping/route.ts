import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";
import { getBearerHeaders } from "@/lib/backend-auth";

export async function POST(req: NextRequest) {
  const headers = getBearerHeaders(req);
  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/auth/ping`,
      null,
      { headers, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Ping failed");
    return NextResponse.json({ error: message }, { status });
  }
}

// Public wake-up ping — no auth required. Hits the backend docs/health
// so Render starts its cold boot before the actual registration request.
export async function GET() {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  try {
    // /docs always exists on FastAPI; a 200 means the server is awake.
    // We use a 10-second timeout so polling stays snappy.
    const res = await fetch(`${backendUrl}/docs`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok || res.status === 405) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false }, { status: 503 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}

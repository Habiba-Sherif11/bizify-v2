import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const base = process.env.BACKEND_URL;
  if (!base) return NextResponse.json({ error: "BACKEND_URL not configured" }, { status: 500 });

  const upstream = await fetch(`${base}/api/v1/notifications/stream`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Notification stream failed" }, { status: upstream.status || 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

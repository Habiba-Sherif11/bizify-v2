import { NextRequest, NextResponse } from "next/server";
import { getBearerHeaders } from "@/lib/backend-auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const headers = getBearerHeaders(req) as Record<string, string>;
  let body: unknown;
  try { body = await req.json(); } catch { body = {}; }

  const upstream = await fetch(
    `${process.env.BACKEND_URL}/api/v1/ai/${section}/chat/stream`,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!upstream.ok) {
    return NextResponse.json({ error: "Chat stream failed" }, { status: upstream.status });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { handleBackendError } from "@/lib/backend-error";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/api/v1/ai/general-chat/stream`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!backendRes.ok) {
      return NextResponse.json({ error: "Streaming request failed" }, { status: backendRes.status });
    }

    return new Response(backendRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Stream failed");
    return NextResponse.json({ error: message }, { status });
  }
}

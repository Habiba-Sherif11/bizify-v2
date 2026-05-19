import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getBearerHeaders } from "@/lib/backend-auth";
import { handleBackendError } from "@/lib/backend-error";

export async function POST(req: NextRequest) {
  const headers = getBearerHeaders(req);
  if (!("Authorization" in headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { message: string; history: Record<string, unknown>[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { message, history = [] } = body;
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/ai/general-chat`,
      { message, history },
      { headers, timeout: 70_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Backend AI chat error:", error);
    const { message: msg, status } = handleBackendError(error, "AI chat failed");
    return NextResponse.json({ error: msg }, { status });
  }
}

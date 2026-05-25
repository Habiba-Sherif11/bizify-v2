import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getBearerHeaders } from "@/lib/backend-auth";
import { handleBackendError } from "@/lib/backend-error";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headers = getBearerHeaders(req);
  const limit = req.nextUrl.searchParams.get("limit") ?? "0";
  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/chat/sessions/${id}/messages?limit=${limit}`,
      { headers, timeout: 15_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to load messages");
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headers = getBearerHeaders(req);
  let body: unknown;
  try { body = await req.json(); } catch { body = {}; }
  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/chat/sessions/${id}/messages`,
      body,
      { headers: { ...headers, "Content-Type": "application/json" }, timeout: 15_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to save messages");
    return NextResponse.json({ error: message }, { status });
  }
}

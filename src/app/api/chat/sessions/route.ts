import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getBearerHeaders } from "@/lib/backend-auth";
import { handleBackendError } from "@/lib/backend-error";

export async function GET(req: NextRequest) {
  const headers = getBearerHeaders(req);
  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/chat/sessions`,
      { headers, timeout: 15_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to load chat sessions");
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  const headers = getBearerHeaders(req);
  let body: unknown;
  try { body = await req.json(); } catch { body = {}; }
  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/chat/sessions`,
      body,
      { headers: { ...headers, "Content-Type": "application/json" }, timeout: 15_000 }
    );
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to create chat session");
    return NextResponse.json({ error: message }, { status });
  }
}

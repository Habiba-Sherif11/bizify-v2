import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getBearerHeaders } from "@/lib/backend-auth";
import { handleBackendError } from "@/lib/backend-error";

export async function GET(req: NextRequest) {
  const headers = getBearerHeaders(req);
  const ideaId = req.nextUrl.searchParams.get("idea_id");
  const url = new URL(`${process.env.BACKEND_URL}/api/v1/ai/customers`);
  if (ideaId) url.searchParams.set("idea_id", ideaId);
  try {
    const { data } = await axios.get(url.toString(), { headers, timeout: 60_000 });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to fetch customers analysis");
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  const headers = getBearerHeaders(req);
  let body: unknown;
  try { body = await req.json(); } catch { body = {}; }
  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/ai/customers`,
      body,
      { headers: { ...headers, "Content-Type": "application/json" }, timeout: 120_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to generate customers analysis");
    return NextResponse.json({ error: message }, { status });
  }
}

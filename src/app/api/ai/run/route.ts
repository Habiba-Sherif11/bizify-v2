import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getBearerHeaders } from "@/lib/backend-auth";
import { handleBackendError } from "@/lib/backend-error";

export async function POST(req: NextRequest) {
  const headers = getBearerHeaders(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/ai/run`,
      body,
      { headers: { ...headers, "Content-Type": "application/json" }, timeout: 120_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to run AI pipeline");
    return NextResponse.json({ error: message }, { status });
  }
}

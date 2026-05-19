import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";
import { getBearerHeaders } from "@/lib/backend-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  const headers = getBearerHeaders(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/groups/join-requests/${requestId}/handle`,
      body,
      { headers: { ...headers, "Content-Type": "application/json" }, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to handle join request");
    return NextResponse.json({ error: message }, { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";
import { getBearerHeaders } from "@/lib/backend-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getBearerHeaders(req);
  const { id } = await params;
  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/marketplace/partners/${id}/requests`,
      { headers, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to fetch partner requests");
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getBearerHeaders(req);
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/marketplace/partners/${id}/requests`,
      body,
      { headers: { ...headers, "Content-Type": "application/json" }, timeout: 30_000 }
    );
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to send collaboration request");
    return NextResponse.json({ error: message }, { status });
  }
}

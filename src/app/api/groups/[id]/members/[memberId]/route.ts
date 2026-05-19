import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";
import { getBearerHeaders } from "@/lib/backend-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { memberId } = await params;
  const headers = getBearerHeaders(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  try {
    const { data } = await axios.patch(
      `${process.env.BACKEND_URL}/api/v1/groups/members/${memberId}`,
      body,
      { headers: { ...headers, "Content-Type": "application/json" }, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to update member");
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { memberId } = await params;
  const headers = getBearerHeaders(req);
  try {
    await axios.delete(
      `${process.env.BACKEND_URL}/api/v1/groups/members/${memberId}`,
      { headers, timeout: 30_000 }
    );
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to remove member");
    return NextResponse.json({ error: message }, { status });
  }
}

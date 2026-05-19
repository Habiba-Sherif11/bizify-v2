import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";
import { getBearerHeaders } from "@/lib/backend-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const headers = getBearerHeaders(req);
  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/groups/${id}`,
      { headers, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to fetch group");
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const headers = getBearerHeaders(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  try {
    const { data } = await axios.patch(
      `${process.env.BACKEND_URL}/api/v1/groups/${id}`,
      body,
      { headers: { ...headers, "Content-Type": "application/json" }, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to update group");
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const headers = getBearerHeaders(req);
  try {
    await axios.delete(
      `${process.env.BACKEND_URL}/api/v1/groups/${id}`,
      { headers, timeout: 30_000 }
    );
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to delete group");
    return NextResponse.json({ error: message }, { status });
  }
}

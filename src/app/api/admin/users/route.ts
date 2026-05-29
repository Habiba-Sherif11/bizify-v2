import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getBearerHeaders } from "@/lib/backend-auth";
import { handleBackendError } from "@/lib/backend-error";

export async function GET(req: NextRequest) {
  const headers = getBearerHeaders(req);
  if (!("Authorization" in headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const skip = searchParams.get("skip") ?? "0";
  const limit = searchParams.get("limit") ?? "100";
  const email = searchParams.get("email");

  try {
    const url = email
      ? `${process.env.BACKEND_URL}/api/v1/admin/users/search?email=${encodeURIComponent(email)}`
      : `${process.env.BACKEND_URL}/api/v1/admin/users?skip=${skip}&limit=${limit}`;
    const { data } = await axios.get(url, { headers, timeout: 30_000 });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to fetch users");
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const headers = getBearerHeaders(req);
  if (!("Authorization" in headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }
  try {
    await axios.delete(
      `${process.env.BACKEND_URL}/api/v1/admin/users?email=${encodeURIComponent(email)}`,
      { headers, timeout: 30_000 }
    );
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to delete user");
    return NextResponse.json({ error: message }, { status });
  }
}

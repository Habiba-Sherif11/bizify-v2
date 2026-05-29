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
  const status = searchParams.get("status");
  const url = status
    ? `${process.env.BACKEND_URL}/api/v1/admin/requests?status=${encodeURIComponent(status)}`
    : `${process.env.BACKEND_URL}/api/v1/admin/requests`;
  try {
    const { data } = await axios.get(url, { headers, timeout: 30_000 });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status: s } = handleBackendError(error, "Failed to fetch requests");
    return NextResponse.json({ error: message }, { status: s });
  }
}

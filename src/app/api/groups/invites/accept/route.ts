import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";
import { getBearerHeaders } from "@/lib/backend-auth";

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  const headers = getBearerHeaders(req);
  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/groups/invites/accept?token=${encodeURIComponent(token)}`,
      null,
      { headers, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to accept invite");
    return NextResponse.json({ error: message }, { status });
  }
}

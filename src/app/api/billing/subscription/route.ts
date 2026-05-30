import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getBearerHeaders } from "@/lib/backend-auth";
import { handleBackendError } from "@/lib/backend-error";

export async function GET(req: NextRequest) {
  const headers = getBearerHeaders(req);
  if (!("Authorization" in headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/billing/subscription`,
      { headers, timeout: 15_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    // 404 means the user has no paid subscription (free tier) — that's normal, not an error
    const axiosErr = error as { response?: { status?: number } };
    if (axiosErr?.response?.status === 404) {
      return NextResponse.json(null, { status: 200 });
    }
    const { message, status } = handleBackendError(error, "Failed to fetch subscription");
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const headers = getBearerHeaders(req);
  if (!("Authorization" in headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { data } = await axios.delete(
      `${process.env.BACKEND_URL}/api/v1/billing/subscription`,
      { headers, timeout: 15_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to cancel subscription");
    return NextResponse.json({ error: message }, { status });
  }
}

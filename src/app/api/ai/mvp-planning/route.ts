import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getBearerHeaders } from "@/lib/backend-auth";
import { handleBackendError } from "@/lib/backend-error";

export async function GET(req: NextRequest) {
  const headers = getBearerHeaders(req);
  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/ai/mvp-planning`,
      { headers, timeout: 60_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to fetch MVP planning");
    return NextResponse.json({ error: message }, { status });
  }
}

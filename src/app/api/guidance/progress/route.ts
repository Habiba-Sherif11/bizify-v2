import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";
import { getBearerHeaders } from "@/lib/backend-auth";

export async function GET(req: NextRequest) {
  const headers = getBearerHeaders(req);
  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/guidance/progress`,
      { headers, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const e = error as { response?: { status?: number } };
    if (e.response?.status === 404) {
      return NextResponse.json(null);
    }
    const { message, status } = handleBackendError(error, "Failed to fetch progress");
    return NextResponse.json({ error: message }, { status });
  }
}

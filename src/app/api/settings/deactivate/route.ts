import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";
import { getBearerHeaders } from "@/lib/backend-auth";

export async function POST(req: NextRequest) {
  const headers = getBearerHeaders(req);
  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/settings/deactivate`,
      null,
      { headers, timeout: 30_000 }
    );
    return NextResponse.json(data ?? {}, { status: 200 });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to deactivate account");
    return NextResponse.json({ error: message }, { status });
  }
}

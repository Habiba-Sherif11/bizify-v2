import { NextRequest, NextResponse } from "next/server";
import { getBearerHeaders } from "@/lib/backend-auth";
import { handleBackendError } from "@/lib/backend-error";

// GET /api/ai/validate/result/[validation_id] — fetch a past validation by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ validation_id: string }> }
) {
  const { validation_id } = await params;
  const headers = getBearerHeaders(req);

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/v1/ai/validate/result/${validation_id}`,
      { headers, method: "GET" }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to fetch validation result");
    return NextResponse.json({ error: message }, { status });
  }
}

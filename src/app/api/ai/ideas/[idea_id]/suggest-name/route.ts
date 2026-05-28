import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getBearerHeaders } from "@/lib/backend-auth";
import { handleBackendError } from "@/lib/backend-error";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ idea_id: string }> }
) {
  const { idea_id } = await params;
  const headers = getBearerHeaders(req);
  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/ai/ideas/${idea_id}/suggest-name`,
      {},
      { headers: { ...headers, "Content-Type": "application/json" }, timeout: 60_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to suggest idea names");
    return NextResponse.json({ error: message }, { status });
  }
}

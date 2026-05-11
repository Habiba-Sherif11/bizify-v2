import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";
import { getBearerHeaders } from "@/lib/backend-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ concept_id: string }> }
) {
  const { concept_id } = await params;
  const headers = getBearerHeaders(req);

  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/guidance/progress/${concept_id}`,
      null,
      { headers, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to update progress");
    return NextResponse.json({ error: message }, { status });
  }
}

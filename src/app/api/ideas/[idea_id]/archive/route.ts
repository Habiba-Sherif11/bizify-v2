import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getBearerHeaders } from "@/lib/backend-auth";
import { handleBackendError } from "@/lib/backend-error";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ idea_id: string }> }
) {
  const { idea_id } = await params;
  const headers = getBearerHeaders(req);
  try {
    const { data } = await axios.patch(
      `${process.env.BACKEND_URL}/api/v1/ideas/${idea_id}/archive`,
      {},
      { headers, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to archive idea");
    return NextResponse.json({ error: message }, { status });
  }
}

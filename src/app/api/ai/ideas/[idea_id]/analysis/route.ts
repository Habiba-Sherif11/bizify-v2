import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getBearerHeaders } from "@/lib/backend-auth";
import { handleBackendError } from "@/lib/backend-error";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { idea_id: string } }
) {
  const headers = getBearerHeaders(req);
  try {
    await axios.delete(
      `${process.env.BACKEND_URL}/api/v1/ai/ideas/${params.idea_id}/analysis`,
      { headers, timeout: 30_000 }
    );
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to clear idea analysis");
    return NextResponse.json({ error: message }, { status });
  }
}

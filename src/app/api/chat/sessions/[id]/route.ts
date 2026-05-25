import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getBearerHeaders } from "@/lib/backend-auth";
import { handleBackendError } from "@/lib/backend-error";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headers = getBearerHeaders(req);
  try {
    await axios.delete(
      `${process.env.BACKEND_URL}/api/v1/chat/sessions/${id}`,
      { headers, timeout: 15_000 }
    );
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to delete chat session");
    return NextResponse.json({ error: message }, { status });
  }
}

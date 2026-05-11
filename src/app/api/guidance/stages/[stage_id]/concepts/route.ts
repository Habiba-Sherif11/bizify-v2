import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";
import { getBearerHeaders } from "@/lib/backend-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ stage_id: string }> }
) {
  const { stage_id } = await params;
  const headers = getBearerHeaders(req);

  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/guidance/stages/${stage_id}/concepts`,
      { headers, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to fetch concepts");
    return NextResponse.json({ error: message }, { status });
  }
}

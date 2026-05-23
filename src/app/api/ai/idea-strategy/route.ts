import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getBearerHeaders } from "@/lib/backend-auth";
import { handleBackendError } from "@/lib/backend-error";

export async function GET(req: NextRequest) {
  const headers = getBearerHeaders(req);
  const ideaId = req.nextUrl.searchParams.get("idea_id");
  const url = new URL(`${process.env.BACKEND_URL}/api/v1/ai/idea-strategy`);
  if (ideaId) url.searchParams.set("idea_id", ideaId);
  try {
    const { data } = await axios.get(url.toString(), { headers, timeout: 60_000 });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to fetch idea strategy");
    return NextResponse.json({ error: message }, { status });
  }
}

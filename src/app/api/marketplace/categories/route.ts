import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";
import { getBearerHeaders } from "@/lib/backend-auth";

export async function GET(req: NextRequest) {
  const headers = getBearerHeaders(req);
  const { searchParams } = req.nextUrl;

  const params: Record<string, string> = {};
  const type = searchParams.get("type");
  if (type) params.type = type;

  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/marketplace/categories`,
      { headers, params, timeout: 10_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to fetch marketplace categories");
    return NextResponse.json({ error: message }, { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";
import { getBearerHeaders } from "@/lib/backend-auth";

export async function GET(req: NextRequest) {
  const headers = getBearerHeaders(req);
  const { searchParams } = req.nextUrl;

  const params: Record<string, string> = {};
  const type = searchParams.get("type");
  const categoryId = searchParams.get("category_id");
  const q = searchParams.get("q");
  const skip = searchParams.get("skip");
  const limit = searchParams.get("limit");
  if (type) params.type = type;
  if (categoryId) params.category_id = categoryId;
  if (q) params.q = q;
  if (skip) params.skip = skip;
  if (limit) params.limit = limit;

  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/marketplace/partners`,
      { headers, params, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to fetch marketplace partners");
    return NextResponse.json({ error: message }, { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getBearerHeaders } from "@/lib/backend-auth";
import { handleBackendError } from "@/lib/backend-error";

// POST /api/ai/[section]/validate — forward multipart file upload to backend
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  const { section } = await params;
  const headers = getBearerHeaders(req);

  // Forward the raw FormData (file + fields) to the backend
  const formData = await req.formData();

  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/v1/ai/validate/${section}`,
      {
        method: "POST",
        headers: {
          // Pass auth but NOT Content-Type — fetch sets multipart boundary automatically
          Authorization: headers["Authorization"] as string,
        },
        body: formData,
        // @ts-expect-error - duplex required for streaming body in Node 18+
        duplex: "half",
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Validation failed");
    return NextResponse.json({ error: message }, { status });
  }
}

// GET /api/ai/[section]/validate — list past validations
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  const { section } = await params;
  const headers = getBearerHeaders(req);
  const ideaId = req.nextUrl.searchParams.get("idea_id");

  const url = new URL(`${process.env.BACKEND_URL}/api/v1/ai/validate/${section}`);
  if (ideaId) url.searchParams.set("idea_id", ideaId);

  try {
    const res = await fetch(url.toString(), { headers, method: "GET" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to fetch validations");
    return NextResponse.json({ error: message }, { status });
  }
}

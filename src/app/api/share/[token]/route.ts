import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/share/${token}`,
      { timeout: 30_000 },
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Share link not found");
    return NextResponse.json({ error: message }, { status });
  }
}

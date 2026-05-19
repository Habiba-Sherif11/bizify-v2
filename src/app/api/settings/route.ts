import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";
import { getBearerHeaders } from "@/lib/backend-auth";

export async function GET(req: NextRequest) {
  const headers = getBearerHeaders(req);
  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/settings/`,
      { headers, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to load settings");
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  const headers = getBearerHeaders(req);
  try {
    const { data } = await axios.delete(
      `${process.env.BACKEND_URL}/api/v1/settings/`,
      { headers, timeout: 30_000 }
    );
    return NextResponse.json(data ?? {}, { status: 200 });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to delete account");
    return NextResponse.json({ error: message }, { status });
  }
}

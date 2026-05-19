import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";
import { getBearerHeaders } from "@/lib/backend-auth";

export async function PATCH(req: NextRequest) {
  const headers = getBearerHeaders(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  try {
    const { data } = await axios.patch(
      `${process.env.BACKEND_URL}/api/v1/settings/password`,
      body,
      { headers: { ...headers, "Content-Type": "application/json" }, timeout: 30_000 }
    );
    return NextResponse.json(data ?? {}, { status: 200 });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to update password");
    return NextResponse.json({ error: message }, { status });
  }
}

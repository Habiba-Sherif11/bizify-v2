import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getBearerHeaders } from "@/lib/backend-auth";
import { handleBackendError } from "@/lib/backend-error";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getBearerHeaders(req);
  if (!("Authorization" in headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const { data } = await axios.patch(
      `${process.env.BACKEND_URL}/api/v1/admin/users/${id}/unsuspend`,
      {},
      { headers, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to unsuspend user");
    return NextResponse.json({ error: message }, { status });
  }
}

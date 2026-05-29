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
  const { searchParams } = new URL(req.url);
  const newRole = searchParams.get("new_role");
  if (!newRole) {
    return NextResponse.json({ error: "new_role is required" }, { status: 400 });
  }
  try {
    const { data } = await axios.patch(
      `${process.env.BACKEND_URL}/api/v1/admin/users/${id}/promote?new_role=${encodeURIComponent(newRole)}`,
      {},
      { headers, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to promote user");
    return NextResponse.json({ error: message }, { status });
  }
}

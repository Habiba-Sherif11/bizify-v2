import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ skill_id: string }> }
) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { skill_id } = await params;

  try {
    await axios.delete(
      `${process.env.BACKEND_URL}/api/v1/profile/skills/${encodeURIComponent(skill_id)}`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 30_000 }
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const { message, status } = handleBackendError(error, "Failed to delete skill");
    return NextResponse.json({ error: message }, { status });
  }
}

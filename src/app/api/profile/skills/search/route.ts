import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q") ?? "";

  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/profile/skills/search`,
      {
        params: { q },
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30_000,
      }
    );
    return NextResponse.json(data);
  } catch (error) {
    const { message, status } = handleBackendError(error, "Failed to search skills");
    return NextResponse.json({ error: message }, { status });
  }
}

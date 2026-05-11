import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/profile/skill-categories`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error) {
    const { message, status } = handleBackendError(error, "Failed to load skill categories");
    return NextResponse.json({ error: message }, { status });
  }
}

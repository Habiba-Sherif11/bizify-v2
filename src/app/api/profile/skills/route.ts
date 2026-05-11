import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/profile/skills`,
      body,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, timeout: 30_000 }
    );
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const { message, status } = handleBackendError(error, "Failed to add skill");
    return NextResponse.json({ error: message }, { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/profile/skills/json`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error) {
    const { message, status } = handleBackendError(error, "Failed to load skills JSON");
    return NextResponse.json({ error: message }, { status });
  }
}

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
      `${process.env.BACKEND_URL}/api/v1/profile/skills/json`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 30_000,
      }
    );
    return NextResponse.json(data);
  } catch (error) {
    const { message, status } = handleBackendError(error, "Failed to update skills JSON");
    return NextResponse.json({ error: message }, { status });
  }
}

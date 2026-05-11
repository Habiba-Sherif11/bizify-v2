import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/profile/questionnaire`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 65_000,
      }
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to submit questionnaire");

    if (process.env.NODE_ENV === "development") {
      const e = error as { response?: { status?: number; data?: unknown } };
      console.error("[Questionnaire] Backend error:", e.response?.status, e.response?.data);
    }

    return NextResponse.json({ error: message }, { status });
  }
}

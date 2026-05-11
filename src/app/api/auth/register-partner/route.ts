import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";

const BACKEND_TIMEOUT = 65_000; // 65 s — Render free tier can take ~60 s to wake

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  try {
    const res = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/users/register-partner`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: BACKEND_TIMEOUT,
      }
    );

    return NextResponse.json(res.data, { status: 201 });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Partner registration failed");

    if (process.env.NODE_ENV === "development") {
      const e = error as { response?: { status?: number; data?: unknown } };
      console.error("[Register Partner] Backend error:", e.response?.status, e.response?.data);
    }

    return NextResponse.json({ error: message }, { status });
  }
}

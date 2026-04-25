import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  // Frontend sends a JSON body, we extract the fields from it
  const body = await request.json();
  const { email, otp_code, new_password } = body;

  if (!email || !otp_code || !new_password) {
    return NextResponse.json(
      { error: "Missing required fields: email, otp_code, new_password" },
      { status: 400 }
    );
  }

  try {
    // The backend expects params in the QUERY string, so we use axios params option
    await axios.post(
      `${process.env.BACKEND_URL}/api/v1/auth/reset-password`,
      null,                                    // no request body
      {
        params: {                             // these become ?email=...&otp_code=...&new_password=...
          email,
          otp_code,
          new_password,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reset password backend error:", error.response?.status, error.message);
    return NextResponse.json(
      { error: error.response?.data?.detail || "Reset failed" },
      { status: error.response?.status || 500 }
    );
  }
}
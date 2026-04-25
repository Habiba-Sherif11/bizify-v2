import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  // 1. Parse the incoming JSON body
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { email, otp_code } = body;

  if (!email || !otp_code) {
    return NextResponse.json(
      { error: "Missing email or otp_code" },
      { status: 400 }
    );
  }

  // 2. Forward to backend with exactly the fields it expects
  try {
    console.log("🔁 Verifying OTP:", { email, otp_code });

    await axios.post(
      `${process.env.BACKEND_URL}/api/v1/auth/verify-otp`,
      { email, otp_code },         // JSON body
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ OTP backend error:", error.response?.status, error.response?.data);
    return NextResponse.json(
      { error: error.response?.data?.detail?.[0]?.msg || "OTP verification failed" },
      { status: error.response?.status || 500 }
    );
  }
}
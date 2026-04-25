import { NextResponse, NextRequest } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    console.log("📝 [Forgot Password] Request received");
    console.log("📧 Email:", email);

    if (!email) {
      console.error("❌ [Forgot Password] Email is missing");
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    console.log("📤 [Forgot Password] Attempting POST to backend with query parameters...");
    console.log("🌐 Backend URL:", `${process.env.BACKEND_URL}/api/v1/auth/forgot-password`);

    // ✅ FIXED: Use query parameter format as per backend API spec
    const response = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/auth/forgot-password?email=${encodeURIComponent(email)}`,
      {}
    );

    console.log("✅ [Forgot Password] Backend accepted request");

    return NextResponse.json({
      message: "If the email exists, a reset code has been sent.",
    });
  } catch (error: any) {
    console.error("❌ [Forgot Password] Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
      },
    });

    // Parse backend validation errors
    const errorData = error.response?.data;
    let errorMsg = "Request failed";

    if (Array.isArray(errorData)) {
      console.error("📋 Validation errors from backend:");
      errorData.forEach((err: any, idx: number) => {
        console.error(`  [${idx}] ${err.loc?.[1] || "unknown"}: ${err.msg || "unknown error"}`);
      });
      errorMsg = errorData[0]?.msg || "Validation failed";
    } else if (errorData?.detail) {
      errorMsg = errorData.detail;
    } else if (errorData?.error) {
      errorMsg = errorData.error;
    } else if (typeof errorData === "string") {
      errorMsg = errorData;
    }

    console.error("📨 Final error message:", errorMsg);

    return NextResponse.json(
      { error: errorMsg },
      { status: error.response?.status || 400 }
    );
  }
}
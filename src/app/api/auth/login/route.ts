import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    console.log("🔐 [Login] Attempt with email:", body.email);

    // Prepare form data for OAuth2 password grant
    const params = new URLSearchParams();
    params.append("grant_type", "password");
    params.append("username", body.email);
    params.append("password", body.password);

    console.log("📤 [Login] Sending to backend:", `${process.env.BACKEND_URL}/api/v1/auth/login`);

    const res = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/auth/login`,
      params,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token } = res.data;

    if (!access_token) {
      console.error("❌ [Login] Backend didn't return access_token");
      return NextResponse.json(
        { error: "Invalid login response from backend" },
        { status: 500 }
      );
    }

    console.log("✅ [Login] Token received from backend, setting cookie...");
    const response = NextResponse.json({ success: true });

    response.cookies.set("auth_token", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    console.log("🍪 [Login] Cookie set successfully");
    console.log("✔️  Cookie details:", {
      name: "auth_token",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });

    return response;
  } catch (error: any) {
    console.error("❌ [Login] Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }
}
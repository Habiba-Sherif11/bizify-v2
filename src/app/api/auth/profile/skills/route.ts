import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Forward to backend with auth token
    const { data } = await axios.patch(
      `${process.env.BACKEND_URL}/api/v1/profile/skills`,
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Skills update error:", error.message);
    return NextResponse.json(
      { error: error.response?.data?.detail || "Skills update failed" },
      { status: error.response?.status || 400 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  // 1. Read the answers object from the frontend
  const body = await request.json();

  // 2. Extract the auth_token cookie
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized – no token" },
      { status: 401 }
    );
  }

  try {
    // 3. Forward to backend with the token as a Bearer header
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/profile/questionnaire`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,   // ← this is the key change
        },
      }
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error(
      "Questionnaire backend error:",
      error.response?.status,
      error.response?.data
    );
    return NextResponse.json(
      { error: error.response?.data?.detail || "Failed to submit questionnaire" },
      { status: error.response?.status || 500 }
    );
  }
}
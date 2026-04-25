import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    // The incoming request is multipart/form-data; forward it directly to the backend.
    const formData = await request.formData();

    const res = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/users/register-partner`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return NextResponse.json(res.data, { status: 201 });
  } catch (error: any) {
    console.error("Partner registration error:", error.response?.status, error.response?.data);
    return NextResponse.json(
      { error: error.response?.data?.detail?.[0]?.msg || "Registration failed" },
      { status: error.response?.status || 500 }
    );
  }
}
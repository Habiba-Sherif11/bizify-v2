import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/users/register`,
      body
    );
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.detail?.[0]?.msg || "Signup failed" },
      { status: error.response?.status || 500 }
    );
  }
}
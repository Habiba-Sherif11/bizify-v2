import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  // Invalidate the token server-side (best-effort — always clear cookie)
  if (token) {
    try {
      await axios.post(
        `${process.env.BACKEND_URL}/api/v1/auth/logout`,
        null,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10_000 }
      );
    } catch {
      // ignore — still clear the cookie below
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

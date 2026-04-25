import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

/**
 * GET /api/auth/me
 * Returns the currently authenticated user (from the auth_token cookie)
 * or { user: null } if not authenticated.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/users/me`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const user = {
      email: data.email || data.username || "",
      role: data.role || "entrepreneur",
      name: data.full_name || data.name || data.username || "",
    };

    return NextResponse.json({ user });
  } catch (error: any) {
    // Failed to fetch user – invalid token or backend error
    return NextResponse.json({ user: null });
  }
}

/**
 * PATCH /api/auth/me
 * Updates the current user's profile (e.g., skills).
 * Expects a JSON body with the fields to update.
 */
export async function PATCH(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();

  try {
    const { data } = await axios.patch(
      `${process.env.BACKEND_URL}/api/v1/users/me`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error(
      "Profile update error:",
      error.response?.status,
      error.response?.data
    );
    return NextResponse.json(
      { error: error.response?.data?.detail || "Update failed" },
      { status: error.response?.status || 500 }
    );
  }
}
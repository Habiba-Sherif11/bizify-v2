import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";

/** Decode a JWT payload without verifying the signature. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = Buffer.from(base64 + padding, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  // The backend embeds email and role in the JWT payload.
  // Decode it directly — no extra backend call needed.
  const payload = decodeJwtPayload(token);

  if (!payload) {
    console.warn("[/api/auth/me] Could not decode JWT payload");
    return NextResponse.json({ user: null });
  }

  // Reject expired tokens immediately
  const exp = payload.exp as number | undefined;
  if (exp && exp * 1000 < Date.now()) {
    return NextResponse.json({ user: null });
  }

  const rawRole = ((payload.role as string) || "ENTREPRENEUR").toLowerCase();

  const user = {
    email: (payload.email as string) || "",
    role: rawRole as "entrepreneur" | "manufacturer" | "mentor" | "supplier" | "admin",
    name: "",
    approval_status: undefined as "PENDING" | "APPROVED" | "REJECTED" | undefined,
    business_id: undefined as string | undefined,
  };

  // Best-effort: fetch full_name and partner approval status from settings
  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/settings/`,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10_000 }
    );
    if (data.full_name) user.name = data.full_name;
  } catch {
    // Non-critical — name falls back to email prefix in the UI
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { data } = await axios.patch(
      `${process.env.BACKEND_URL}/api/v1/settings/profile`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 65_000,
      }
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Update failed");
    return NextResponse.json({ error: message }, { status });
  }
}

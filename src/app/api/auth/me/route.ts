import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  const headers = { Authorization: `Bearer ${token}` };

  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/users/me`,
      { headers, timeout: 65_000 }
    );

    const rawRole = (data.role || "ENTREPRENEUR") as string;
    const user = {
      email: data.email || "",
      role: rawRole.toLowerCase() as "entrepreneur" | "manufacturer" | "mentor" | "supplier" | "admin",
      name: data.full_name || "",
      approval_status: data.approval_status as "PENDING" | "APPROVED" | "REJECTED" | undefined,
      business_id: data.business_id as string | undefined,
    };

    return NextResponse.json({ user });
  } catch (err: unknown) {
    const e = err as { response?: { status?: number; data?: unknown }; code?: string };
    console.error(
      "[/api/auth/me] Failed:",
      e.response?.status ?? e.code,
      JSON.stringify(e.response?.data)
    );
    return NextResponse.json({ user: null });
  }
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

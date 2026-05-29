import { NextResponse } from "next/server";
import axios from "axios";
import { handleBackendError } from "@/lib/backend-error";

export async function GET() {
  try {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/billing/plans`,
      { timeout: 15_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to fetch plans");
    return NextResponse.json({ error: message }, { status });
  }
}

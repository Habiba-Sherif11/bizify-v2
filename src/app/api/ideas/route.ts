import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getBearerHeaders } from "@/lib/backend-auth";
import { handleBackendError } from "@/lib/backend-error";

export async function GET(req: NextRequest) {
  const headers = getBearerHeaders(req);
  const backendUrl = new URL(`${process.env.BACKEND_URL}/api/v1/ideas/`);
  req.nextUrl.searchParams.forEach((value, key) => backendUrl.searchParams.set(key, value));

  try {
    const { data } = await axios.get(backendUrl.toString(), { headers, timeout: 30_000 });
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to fetch ideas");
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  const headers = getBearerHeaders(req);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  try {
    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/ideas/`,
      body,
      { headers: { ...headers, "Content-Type": "application/json" }, timeout: 30_000 }
    );
    return NextResponse.json(data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Failed to create idea");
    return NextResponse.json({ error: message }, { status });
  }
}

import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function GET(req: NextRequest) {
  return proxyBackend(req, {
    method: "GET",
    path: "/ai/idea-strategy",
    timeout: 60_000,
    fallback: "Failed to fetch idea strategy",
  });
}

export async function POST(req: NextRequest) {
  return proxyBackend(req, {
    method: "POST",
    path: "/ai/idea-strategy",
    timeout: 120_000,
    fallback: "Failed to generate idea strategy",
  });
}

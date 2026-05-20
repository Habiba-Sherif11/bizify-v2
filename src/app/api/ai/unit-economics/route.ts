import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function GET(req: NextRequest) {
  return proxyBackend(req, {
    method: "GET",
    path: "/ai/unit-economics",
    timeout: 60_000,
    fallback: "Failed to fetch unit economics",
  });
}

export async function POST(req: NextRequest) {
  return proxyBackend(req, {
    method: "POST",
    path: "/ai/unit-economics",
    timeout: 120_000,
    fallback: "Failed to generate unit economics",
  });
}

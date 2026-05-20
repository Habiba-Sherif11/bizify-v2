import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function GET(req: NextRequest) {
  return proxyBackend(req, {
    method: "GET",
    path: "/ai/mvp-planning",
    timeout: 60_000,
    fallback: "Failed to fetch MVP planning",
  });
}

export async function POST(req: NextRequest) {
  return proxyBackend(req, {
    method: "POST",
    path: "/ai/mvp-planning",
    timeout: 120_000,
    fallback: "Failed to generate MVP planning",
  });
}

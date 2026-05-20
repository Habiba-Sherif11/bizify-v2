import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function GET(req: NextRequest) {
  return proxyBackend(req, {
    method: "GET",
    path: "/ai/go-to-market",
    timeout: 60_000,
    fallback: "Failed to fetch go-to-market strategy",
  });
}

export async function POST(req: NextRequest) {
  return proxyBackend(req, {
    method: "POST",
    path: "/ai/go-to-market",
    timeout: 120_000,
    fallback: "Failed to generate go-to-market strategy",
  });
}

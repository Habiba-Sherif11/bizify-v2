import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function GET(req: NextRequest) {
  return proxyBackend(req, {
    method: "GET",
    path: "/ai/market-potential",
    timeout: 60_000,
    fallback: "Failed to fetch market potential",
  });
}

export async function POST(req: NextRequest) {
  return proxyBackend(req, {
    method: "POST",
    path: "/ai/market-potential",
    timeout: 120_000,
    fallback: "Failed to generate market potential",
  });
}

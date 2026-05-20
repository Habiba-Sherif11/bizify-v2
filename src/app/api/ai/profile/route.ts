import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function GET(req: NextRequest) {
  return proxyBackend(req, {
    method: "GET",
    path: "/ai/profile",
    timeout: 60_000,
    fallback: "Failed to fetch profile analysis",
  });
}

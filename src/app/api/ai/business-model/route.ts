import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function GET(req: NextRequest) {
  return proxyBackend(req, {
    method: "GET",
    path: "/ai/business-model",
    timeout: 60_000,
    fallback: "Failed to fetch business model analysis",
  });
}

export async function POST(req: NextRequest) {
  return proxyBackend(req, {
    method: "POST",
    path: "/ai/business-model",
    timeout: 120_000,
    fallback: "Failed to generate business model analysis",
  });
}

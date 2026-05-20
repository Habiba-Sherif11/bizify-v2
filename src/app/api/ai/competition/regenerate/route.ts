import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function POST(req: NextRequest) {
  return proxyBackend(req, {
    method: "POST",
    path: "/ai/competition/regenerate",
    timeout: 120_000,
    fallback: "Failed to regenerate competition analysis",
  });
}

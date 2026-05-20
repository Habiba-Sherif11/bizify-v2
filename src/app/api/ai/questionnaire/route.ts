import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function GET(req: NextRequest) {
  return proxyBackend(req, {
    method: "GET",
    path: "/ai/questionnaire",
    timeout: 30_000,
    fallback: "Failed to fetch questionnaire",
  });
}

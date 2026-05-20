import { NextRequest } from "next/server";
import { proxyBackend, readJsonBody } from "@/lib/proxy-backend";

export async function GET(req: NextRequest) {
  return proxyBackend(req, {
    method: "GET",
    path: "/ai/idea-intake",
    timeout: 60_000,
    fallback: "Failed to fetch idea intake",
  });
}

export async function POST(req: NextRequest) {
  const { body, error } = await readJsonBody(req);
  if (error) return error;
  return proxyBackend(req, {
    method: "POST",
    path: "/ai/idea-intake",
    body,
    timeout: 120_000,
    fallback: "Failed to submit idea intake",
  });
}

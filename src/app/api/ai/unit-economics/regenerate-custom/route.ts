import { NextRequest } from "next/server";
import { proxyBackend, readJsonBody } from "@/lib/proxy-backend";

export async function POST(req: NextRequest) {
  const { body, error } = await readJsonBody(req);
  if (error) return error;
  return proxyBackend(req, {
    method: "POST",
    path: "/ai/unit-economics/regenerate-custom",
    body,
    timeout: 120_000,
    fallback: "Failed to regenerate unit economics",
  });
}

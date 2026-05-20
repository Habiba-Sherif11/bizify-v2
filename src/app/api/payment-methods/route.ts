import { NextRequest } from "next/server";
import { proxyBackend, readJsonBody } from "@/lib/proxy-backend";

export async function GET(req: NextRequest) {
  return proxyBackend(req, {
    method: "GET",
    path: "/payment-methods/",
    fallback: "Failed to load payment methods",
  });
}

export async function POST(req: NextRequest) {
  const { body, error } = await readJsonBody(req);
  if (error) return error;
  return proxyBackend(req, {
    method: "POST",
    path: "/payment-methods/",
    body,
    fallback: "Failed to add payment method",
  });
}

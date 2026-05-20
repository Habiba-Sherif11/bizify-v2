import { NextRequest } from "next/server";
import { proxyBackend, readJsonBody } from "@/lib/proxy-backend";

export async function POST(req: NextRequest) {
  const { body, error } = await readJsonBody(req);
  if (error) return error;
  return proxyBackend(req, {
    method: "POST",
    path: "/ai/customers/chat",
    body,
    timeout: 70_000,
    fallback: "Customers chat failed",
  });
}

import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function GET(req: NextRequest) {
  return proxyBackend(req, {
    method: "GET",
    path: "/billing/subscription",
    fallback: "Failed to load subscription",
  });
}

export async function DELETE(req: NextRequest) {
  return proxyBackend(req, {
    method: "DELETE",
    path: "/billing/subscription",
    noContent: true,
    fallback: "Failed to cancel subscription",
  });
}

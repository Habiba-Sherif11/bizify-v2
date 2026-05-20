import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.toString();
  return proxyBackend(req, {
    method: "GET",
    path: "/admin/security-logs",
    query,
    fallback: "Failed to fetch security logs",
  });
}

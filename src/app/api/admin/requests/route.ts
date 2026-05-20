import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function GET(req: NextRequest) {
  return proxyBackend(req, {
    method: "GET",
    path: "/admin/requests",
    fallback: "Failed to fetch partner requests",
  });
}

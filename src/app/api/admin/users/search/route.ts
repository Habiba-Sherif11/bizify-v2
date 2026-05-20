import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.toString();
  return proxyBackend(req, {
    method: "GET",
    path: "/admin/users/search",
    query,
    fallback: "Failed to search users",
  });
}

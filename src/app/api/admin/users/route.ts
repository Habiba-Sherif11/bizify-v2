import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.toString();
  return proxyBackend(req, {
    method: "GET",
    path: "/admin/users",
    query,
    fallback: "Failed to fetch users",
  });
}

export async function DELETE(req: NextRequest) {
  const query = req.nextUrl.searchParams.toString();
  return proxyBackend(req, {
    method: "DELETE",
    path: "/admin/users",
    query,
    noContent: true,
    fallback: "Failed to delete user",
  });
}

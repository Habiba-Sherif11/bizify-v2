import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const { user_id } = await params;
  return proxyBackend(req, {
    method: "GET",
    path: `/users/${encodeURIComponent(user_id)}`,
    fallback: "Failed to fetch user",
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const { user_id } = await params;
  return proxyBackend(req, {
    method: "DELETE",
    path: `/users/${encodeURIComponent(user_id)}`,
    noContent: true,
    fallback: "Failed to delete user",
  });
}

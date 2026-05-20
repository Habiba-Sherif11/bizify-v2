import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ notification_id: string }> }
) {
  const { notification_id } = await params;
  return proxyBackend(req, {
    method: "DELETE",
    path: `/notifications/${encodeURIComponent(notification_id)}`,
    noContent: true,
    fallback: "Failed to delete notification",
  });
}

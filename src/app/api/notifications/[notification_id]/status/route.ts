import { NextRequest } from "next/server";
import { proxyBackend, readJsonBody } from "@/lib/proxy-backend";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ notification_id: string }> }
) {
  const { notification_id } = await params;
  const { body, error } = await readJsonBody(req);
  if (error) return error;
  return proxyBackend(req, {
    method: "PATCH",
    path: `/notifications/${encodeURIComponent(notification_id)}/status`,
    body,
    fallback: "Failed to update notification status",
  });
}

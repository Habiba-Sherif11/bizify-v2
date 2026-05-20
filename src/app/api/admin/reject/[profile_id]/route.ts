import { NextRequest } from "next/server";
import { proxyBackend, readJsonBody } from "@/lib/proxy-backend";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ profile_id: string }> }
) {
  const { profile_id } = await params;
  const { body, error } = await readJsonBody(req);
  if (error) return error;
  return proxyBackend(req, {
    method: "PATCH",
    path: `/admin/reject/${encodeURIComponent(profile_id)}`,
    body,
    fallback: "Failed to reject partner",
  });
}

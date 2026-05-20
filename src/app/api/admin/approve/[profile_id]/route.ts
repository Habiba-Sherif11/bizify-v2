import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ profile_id: string }> }
) {
  const { profile_id } = await params;
  return proxyBackend(req, {
    method: "PATCH",
    path: `/admin/approve/${encodeURIComponent(profile_id)}`,
    fallback: "Failed to approve partner",
  });
}

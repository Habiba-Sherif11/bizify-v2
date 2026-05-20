import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const { job_id } = await params;
  return proxyBackend(req, {
    method: "POST",
    path: `/export/${encodeURIComponent(job_id)}/cancel`,
    fallback: "Failed to cancel export",
  });
}

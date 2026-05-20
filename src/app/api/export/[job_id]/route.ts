import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const { job_id } = await params;
  return proxyBackend(req, {
    method: "GET",
    path: `/export/${encodeURIComponent(job_id)}`,
    fallback: "Failed to fetch export status",
  });
}

import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ document_id: string }> }
) {
  const { document_id } = await params;
  return proxyBackend(req, {
    method: "GET",
    path: `/import/${encodeURIComponent(document_id)}/export-ai`,
    timeout: 60_000,
    fallback: "Failed to export document for AI",
  });
}

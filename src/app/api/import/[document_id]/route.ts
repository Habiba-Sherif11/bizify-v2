import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ document_id: string }> }
) {
  const { document_id } = await params;
  return proxyBackend(req, {
    method: "DELETE",
    path: `/import/${encodeURIComponent(document_id)}`,
    noContent: true,
    fallback: "Failed to delete document",
  });
}

import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ method_id: string }> }
) {
  const { method_id } = await params;
  return proxyBackend(req, {
    method: "DELETE",
    path: `/payment-methods/${encodeURIComponent(method_id)}`,
    noContent: true,
    fallback: "Failed to remove payment method",
  });
}

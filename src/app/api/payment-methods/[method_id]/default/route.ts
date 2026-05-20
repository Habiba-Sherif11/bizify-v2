import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ method_id: string }> }
) {
  const { method_id } = await params;
  return proxyBackend(req, {
    method: "PUT",
    path: `/payment-methods/${encodeURIComponent(method_id)}/default`,
    fallback: "Failed to set default payment method",
  });
}

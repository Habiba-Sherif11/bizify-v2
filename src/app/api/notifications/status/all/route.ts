import { NextRequest } from "next/server";
import { proxyBackend } from "@/lib/proxy-backend";

export async function DELETE(req: NextRequest) {
  return proxyBackend(req, {
    method: "DELETE",
    path: "/notifications/status/all",
    noContent: true,
    fallback: "Failed to clear notifications",
  });
}

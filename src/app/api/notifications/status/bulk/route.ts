import { NextRequest } from "next/server";
import { proxyBackend, readJsonBody } from "@/lib/proxy-backend";

export async function PATCH(req: NextRequest) {
  const { body, error } = await readJsonBody(req);
  if (error) return error;
  return proxyBackend(req, {
    method: "PATCH",
    path: "/notifications/status/bulk",
    body,
    fallback: "Failed to bulk-update notifications",
  });
}

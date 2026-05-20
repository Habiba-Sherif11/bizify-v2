import { NextRequest } from "next/server";
import { proxyBackend, readJsonBody } from "@/lib/proxy-backend";

export async function GET(req: NextRequest) {
  return proxyBackend(req, {
    method: "GET",
    path: "/notifications/settings",
    fallback: "Failed to fetch notification settings",
  });
}

export async function PATCH(req: NextRequest) {
  const { body, error } = await readJsonBody(req);
  if (error) return error;
  return proxyBackend(req, {
    method: "PATCH",
    path: "/notifications/settings",
    body,
    fallback: "Failed to update notification settings",
  });
}

import { NextRequest } from "next/server";
import { proxyBackend, readJsonBody } from "@/lib/proxy-backend";

export async function GET(req: NextRequest) {
  return proxyBackend(req, {
    method: "GET",
    path: "/users/partner-profile",
    fallback: "Failed to fetch partner profile",
  });
}

export async function PATCH(req: NextRequest) {
  const { body, error } = await readJsonBody(req);
  if (error) return error;
  return proxyBackend(req, {
    method: "PATCH",
    path: "/users/partner-profile",
    body,
    fallback: "Failed to update partner profile",
  });
}

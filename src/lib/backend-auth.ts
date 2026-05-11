import type { NextRequest } from "next/server";

/**
 * Reads the auth_token cookie from an incoming Next.js request and returns
 * the Authorization header the backend expects.
 * Returns an empty object if no token is present (caller should handle 401).
 */
export function getBearerHeaders(
  req: NextRequest
): { Authorization: string } | Record<string, never> {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

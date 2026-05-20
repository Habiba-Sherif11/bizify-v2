import { NextRequest } from "next/server";
import { proxyBackendStream, readJsonBody } from "@/lib/proxy-backend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { body, error } = await readJsonBody(req);
  if (error) return error;
  return proxyBackendStream(req, "/ai/idea-strategy/chat/stream", body);
}

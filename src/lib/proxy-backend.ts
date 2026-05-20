import { NextRequest, NextResponse } from "next/server";
import axios, { type AxiosRequestConfig, type Method } from "axios";
import { handleBackendError } from "./backend-error";
import { getBearerHeaders } from "./backend-auth";

const DEFAULT_TIMEOUT = 30_000;

type ProxyOptions = {
  method: Method;
  /** Path appended to `${BACKEND_URL}/api/v1` (e.g. "/notifications/123") */
  path: string;
  /** Optional body for write methods; ignored for GET/DELETE/HEAD. */
  body?: unknown;
  /** Optional query string (without leading ?) to forward to the backend. */
  query?: string;
  /** Timeout in ms (default 30s; bump for AI calls). */
  timeout?: number;
  /** Error message shown to the client if the backend fails. */
  fallback?: string;
  /** When set, return 204 with no body on success (else returns JSON). */
  noContent?: boolean;
};

/**
 * Generic backend proxy used by Next.js route handlers.
 *
 * It forwards the auth_token cookie as a Bearer header, calls
 * `${BACKEND_URL}/api/v1${path}`, and normalizes FastAPI errors.
 */
export async function proxyBackend(
  req: NextRequest,
  options: ProxyOptions
): Promise<NextResponse> {
  const headers = getBearerHeaders(req);
  const base = process.env.BACKEND_URL;
  if (!base) {
    return NextResponse.json({ error: "BACKEND_URL not configured" }, { status: 500 });
  }

  const qs = options.query ? `?${options.query}` : "";
  const url = `${base}/api/v1${options.path}${qs}`;

  const config: AxiosRequestConfig = {
    method: options.method,
    url,
    headers,
    timeout: options.timeout ?? DEFAULT_TIMEOUT,
    validateStatus: () => true,
  };

  const upper = options.method.toUpperCase();
  if (upper !== "GET" && upper !== "DELETE" && upper !== "HEAD") {
    config.data = options.body ?? {};
    config.headers = { ...headers, "Content-Type": "application/json" };
  }

  try {
    const res = await axios.request(config);
    if (res.status >= 400) {
      return NextResponse.json(
        { error: parseError(res.data, options.fallback ?? "Request failed") },
        { status: res.status }
      );
    }
    if (options.noContent || res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json(res.data);
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, options.fallback ?? "Request failed");
    return NextResponse.json({ error: message }, { status });
  }
}

function parseError(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const d = data as Record<string, unknown>;
  if (typeof d.detail === "string") return d.detail;
  if (Array.isArray(d.detail) && d.detail.length > 0) {
    const first = d.detail[0] as Record<string, unknown> | undefined;
    if (typeof first?.msg === "string") return first.msg;
  }
  if (typeof d.error === "string") return d.error;
  if (typeof d.message === "string") return d.message;
  return fallback;
}

/**
 * Read JSON body safely. Returns { error: NextResponse } on failure
 * so callers can early-return.
 */
export async function readJsonBody(req: NextRequest): Promise<
  { body: unknown; error: null } | { body: null; error: NextResponse }
> {
  try {
    return { body: await req.json(), error: null };
  } catch {
    return {
      body: null,
      error: NextResponse.json({ error: "Invalid request body" }, { status: 400 }),
    };
  }
}

/**
 * Proxy an SSE stream from the backend back to the client without buffering.
 */
export async function proxyBackendStream(
  req: NextRequest,
  path: string,
  body: unknown
): Promise<Response> {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const base = process.env.BACKEND_URL;
  if (!base) return NextResponse.json({ error: "BACKEND_URL not configured" }, { status: 500 });

  try {
    const upstream = await fetch(`${base}/api/v1${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body ?? {}),
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: "Streaming request failed" },
        { status: upstream.status || 502 }
      );
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const { message, status } = handleBackendError(error, "Stream failed");
    return NextResponse.json({ error: message }, { status });
  }
}

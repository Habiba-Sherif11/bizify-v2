/**
 * Parses the error shape that FastAPI returns and extracts a human-readable message.
 *
 * FastAPI returns two common error shapes:
 *   - Validation errors: { detail: [{ loc, msg, type }] }
 *   - General errors:   { detail: "some string" }
 *
 * Some endpoints also return { error: "..." }.
 */
export function parseBackendError(data: unknown): string {
  if (!data || typeof data !== "object") return "Request failed";

  const d = data as Record<string, unknown>;

  // { detail: [{ msg: "..." }] }
  if (Array.isArray(d.detail)) {
    const first = d.detail[0] as Record<string, unknown> | undefined;
    return typeof first?.msg === "string" ? first.msg : "Validation failed";
  }

  // { detail: "string" }
  if (typeof d.detail === "string") return d.detail;

  // { error: "string" }
  if (typeof d.error === "string") return d.error;

  // { message: "string" }
  if (typeof d.message === "string") return d.message;

  return "Request failed";
}

type AxiosLike = {
  response?: { status?: number; data?: unknown };
  message?: string;
  code?: string;
};

export function handleBackendError(
  error: unknown,
  fallback = "Request failed"
): { message: string; status: number } {
  const e = error as AxiosLike;

  if (e.response) {
    return {
      message: parseBackendError(e.response.data) || fallback,
      status: e.response.status ?? 500,
    };
  }

  // Network-level error (backend unreachable / timed out)
  const isTimeout = e.code === "ECONNABORTED" || e.message?.includes("timeout");
  return {
    message: isTimeout
      ? "The server took too long to respond. Please try again."
      : "Could not reach the server. Please check your connection.",
    status: 503,
  };
}

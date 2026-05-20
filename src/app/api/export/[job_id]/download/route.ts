import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const base = process.env.BACKEND_URL;
  if (!base) return NextResponse.json({ error: "BACKEND_URL not configured" }, { status: 500 });

  const { job_id } = await params;

  try {
    const upstream = await fetch(
      `${base}/api/v1/export/${encodeURIComponent(job_id)}/download`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Download failed" }, { status: upstream.status || 502 });
    }
    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition":
          upstream.headers.get("content-disposition") || `attachment; filename="export-${job_id}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Download failed" }, { status: 503 });
  }
}

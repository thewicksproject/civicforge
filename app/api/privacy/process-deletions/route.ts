import { NextResponse } from "next/server";
import { processPendingDeletions } from "@/lib/privacy/deletion";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const configuredSecret = process.env.CRON_SECRET;
  if (!configuredSecret) {
    return process.env.NODE_ENV !== "production";
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length).trim();
  return token === configuredSecret;
}

async function runDeletionJob(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await processPendingDeletions();
    const completed = results.filter((r) => r.status === "completed").length;
    const failed = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      ok: true,
      processed: results.length,
      completed,
      failed,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Deletion job failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return runDeletionJob(request);
}

export async function POST(request: Request) {
  return runDeletionJob(request);
}

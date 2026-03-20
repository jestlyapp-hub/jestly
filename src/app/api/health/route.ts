import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  const checks: Record<string, { ok: boolean; ms?: number; error?: string }> =
    {};

  // Check DB
  try {
    const dbStart = Date.now();
    const supabase = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("sites") as any)
      .select("id")
      .limit(1);
    checks.database = {
      ok: !error,
      ms: Date.now() - dbStart,
      ...(error && { error: error.message }),
    };
  } catch (e) {
    checks.database = {
      ok: false,
      error: e instanceof Error ? e.message : "unknown",
    };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  const responseTime = Date.now() - start;

  if (!allOk) {
    logger.warn("health_check_degraded", {
      action: "health_check",
      duration: responseTime,
      checks: JSON.stringify(checks),
    } as Record<string, unknown>);
  }

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      responseTime,
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}

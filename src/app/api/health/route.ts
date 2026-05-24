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

  // Check Resend env
  checks.resend = {
    ok: !!process.env.RESEND_API_KEY,
    ...(process.env.RESEND_API_KEY ? {} : { error: "RESEND_API_KEY missing" }),
  };

  // Check Sentry env (optional — does not affect overall health status)
  const hasSentry = !!process.env.SENTRY_DSN || !!process.env.NEXT_PUBLIC_SENTRY_DSN;
  checks.sentry = {
    ok: hasSentry,
    ...(hasSentry ? {} : { error: "SENTRY_DSN not configured (optional)" }),
  };

  // Only critical services (DB, Resend) affect health status
  const criticalOk = checks.database.ok && checks.resend.ok;
  const responseTime = Date.now() - start;

  if (!criticalOk) {
    logger.warn("health_check_degraded", {
      action: "health_check",
      duration: responseTime,
      checks: JSON.stringify(checks),
    } as Record<string, unknown>);
  }

  return NextResponse.json(
    {
      status: criticalOk ? (hasSentry ? "healthy" : "healthy_no_sentry") : "degraded",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      responseTime,
      checks,
    },
    { status: criticalOk ? 200 : 503 }
  );
}

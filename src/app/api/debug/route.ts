import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// TEMPORARY debug route — remove after diagnosis
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("key");
  if (secret !== "jestly-diag-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  const checks: Record<string, unknown> = {
    hasUrl: !!url,
    urlPrefix: url ? url.slice(0, 30) + "..." : null,
    hasAnonKey: !!anonKey,
    anonKeyPrefix: anonKey ? anonKey.slice(0, 10) + "..." : null,
    hasServiceKey: !!serviceKey,
    serviceKeyPrefix: serviceKey ? serviceKey.slice(0, 10) + "..." : null,
    hasResendKey: !!resendKey,
  };

  // Test table existence
  if (url && serviceKey) {
    try {
      const supabase = createClient(url, serviceKey);
      const { count, error } = await (supabase.from("waitlist") as any)
        .select("id", { count: "exact", head: true });
      checks.waitlistTableExists = !error;
      checks.waitlistCount = count;
      checks.waitlistError = error ? { code: error.code, message: error.message, hint: error.hint } : null;

      // Test insert + rollback
      const { error: insertErr } = await (supabase.from("waitlist") as any)
        .insert({
          email: `__diag_test_${Date.now()}@test.invalid`,
          first_name: "DIAG",
          job_type: "test",
          status: "new",
          score: 0,
          metadata: {},
        })
        .select("id")
        .single();

      checks.insertTest = insertErr
        ? { code: insertErr.code, message: insertErr.message, hint: insertErr.hint }
        : "OK";

      // Cleanup
      if (!insertErr) {
        await (supabase.from("waitlist") as any)
          .delete()
          .like("email", "__diag_test_%@test.invalid");
      }
    } catch (e: any) {
      checks.supabaseError = e.message;
    }
  }

  return NextResponse.json(checks);
}

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/log-error — Client-side error logging endpoint.
 * Replaces Sentry for basic error tracking during beta.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, source, userId, metadata, url } = body;

    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    await (supabase.from("error_logs") as any).insert({
      level: body.level || "error",
      message: String(message).slice(0, 2000),
      source: String(source || "client").slice(0, 100),
      user_id: userId || null,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : {},
      url: String(url || "").slice(0, 500),
      user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

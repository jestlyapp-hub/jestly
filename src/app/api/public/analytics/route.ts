import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/public/analytics — track an event (anonymous)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { site_id, type, page_slug, data, visitor_id } = body as {
    site_id?: string;
    type?: string;
    page_slug?: string;
    data?: Record<string, string | number | boolean | null>;
    visitor_id?: string;
  };

  if (!site_id || !type) {
    return NextResponse.json({ error: "site_id and type are required" }, { status: 400 });
  }

  const validTypes = ["page_view", "click_cta", "form_submit", "order_start", "order_complete"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("analytics_events") as any).insert({
    site_id,
    type,
    page_slug: page_slug || null,
    data: data || {},
    visitor_id: visitor_id || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

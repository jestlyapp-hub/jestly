import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/public/leads — submit a lead from a public site form
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { site_id, name, email, phone, source, message, fields } = body as {
    site_id?: string;
    name?: string;
    email?: string;
    phone?: string;
    source?: string;
    message?: string;
    fields?: Record<string, string | number | boolean | null>;
  };

  if (!site_id || !email) {
    return NextResponse.json({ error: "site_id and email are required" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("leads") as any)
    .insert({
      site_id,
      email,
      name: name || null,
      phone: phone || null,
      source: source || null,
      message: message || null,
      fields: fields || {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

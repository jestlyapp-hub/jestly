import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/billing/recurring — list recurring profiles
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("recurring_billing_profiles") as any)
    .select("*, clients(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// POST /api/billing/recurring — create a recurring profile
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const allowed = [
    "client_id", "template_id", "title", "description", "category",
    "quantity", "unit", "unit_price", "currency", "tax_rate", "tags",
    "frequency", "gen_day", "auto_generate", "status", "start_date", "end_date",
  ];

  const row: Record<string, unknown> = { user_id: user.id };
  for (const key of allowed) {
    if (key in body) row[key] = body[key];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("recurring_billing_profiles") as any)
    .insert(row)
    .select("*, clients(name)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

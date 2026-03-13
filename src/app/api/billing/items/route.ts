import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/billing/items — list billing items with optional filters
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const url = req.nextUrl;
  const status = url.searchParams.get("status");
  const clientId = url.searchParams.get("client_id");
  const periodStart = url.searchParams.get("period_start");
  const periodEnd = url.searchParams.get("period_end");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("billing_items") as any)
    .select("*, clients(name, email)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  if (clientId) query = query.eq("client_id", clientId);
  if (periodStart) query = query.gte("performed_at", periodStart);
  if (periodEnd) query = query.lte("performed_at", periodEnd);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}

// POST /api/billing/items — create a billing item
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const allowed = [
    "client_id", "order_id", "title", "description", "category",
    "quantity", "unit", "unit_price", "currency", "tax_rate",
    "status", "performed_at", "delivered_at", "period_start", "period_end",
    "source", "tags", "notes", "recurring",
  ];

  const row: Record<string, unknown> = { user_id: user.id };
  for (const key of allowed) {
    if (key in body) row[key] = body[key];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("billing_items") as any)
    .insert(row)
    .select("*, clients(name, email)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// POST /api/billing/recurring/[id]/generate — generate billing item from recurring profile
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // Fetch the profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error: pErr } = await (supabase.from("recurring_billing_profiles") as any)
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (pErr || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Build the billing item for current month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const item = {
    user_id: user.id,
    client_id: profile.client_id,
    title: profile.title,
    description: profile.description,
    category: profile.category,
    quantity: profile.quantity,
    unit: profile.unit,
    unit_price: profile.unit_price,
    currency: profile.currency,
    tax_rate: profile.tax_rate,
    tags: profile.tags,
    source: "recurring",
    recurring: true,
    recurring_profile_id: profile.id,
    performed_at: monthStart,
    period_start: monthStart,
    period_end: monthEnd,
    status: "draft",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("billing_items") as any)
    .insert(item)
    .select("*, clients(name, email)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

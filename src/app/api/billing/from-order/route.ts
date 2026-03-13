import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

/** Billing item initial status (not an order status) */
const BILLING_DRAFT = "draft";

// POST /api/billing/from-order — create billing item from an order
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { order_id } = await req.json();
  if (!order_id) return NextResponse.json({ error: "order_id required" }, { status: 400 });

  // Fetch the order
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: oErr } = await (supabase.from("orders") as any)
    .select("*, clients(name), services(title)")
    .eq("id", order_id)
    .eq("user_id", user.id)
    .single();

  if (oErr || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const item = {
    user_id: user.id,
    client_id: order.client_id,
    order_id: order.id,
    title: order.title || order.services?.title || "Commande",
    description: order.description || "",
    category: order.category || "",
    quantity: 1,
    unit: "forfait",
    unit_price: Number(order.amount) || 0,
    currency: "EUR",
    tax_rate: 0,
    source: "order",
    status: BILLING_DRAFT,
    performed_at: new Date().toISOString().slice(0, 10),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("billing_items") as any)
    .insert(item)
    .select("*, clients(name, email)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

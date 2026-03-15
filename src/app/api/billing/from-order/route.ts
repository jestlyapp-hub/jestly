import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

/** Billing item initial status (not an order status) */
const BILLING_DRAFT = "draft";

// POST /api/billing/from-order — create billing item from an order
// SCHEMA: JOIN products(name) not services(title) — migration 017
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { order_id } = await req.json();
  if (!order_id) return NextResponse.json({ error: "order_id required" }, { status: 400 });

  // Fetch the order — NO nested products() select (PostgREST FK issue)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: oErr } = await (supabase.from("orders") as any)
    .select("*, clients(name)")
    .eq("id", order_id)
    .eq("user_id", user.id)
    .single();

  if (oErr || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Fetch product name separately if product_id exists
  let productName: string | null = null;
  if (order.product_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prod } = await (supabase.from("products") as any)
      .select("name")
      .eq("id", order.product_id)
      .maybeSingle();
    productName = prod?.name ?? null;
  }

  const item = {
    user_id: user.id,
    client_id: order.client_id,
    order_id: order.id,
    title: order.title || productName || "Commande",
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

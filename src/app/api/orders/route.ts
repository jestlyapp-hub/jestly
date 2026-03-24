import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/orders — list user's orders with client+product+items join
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const source = req.nextUrl.searchParams.get("source");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("orders") as any)
    .select("*, clients(name, email, phone), order_brief_responses(order_id), order_items(id, label, description, quantity, unit_price, product_id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Filter by source (site orders only come from product_id not null)
  if (source === "site") {
    query = query.not("product_id", "is", null);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// ── Line item type from request body ──
interface BodyLineItem {
  label: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  productId?: string;
}

// POST /api/orders — create one or many orders (bulk via quantity)
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const {
    client_id, product_id, title, description, amount, status, priority,
    deadline, custom_fields, briefing, resources, category, external_ref,
    quantity,
  } = body;

  // Parse line items
  const items: BodyLineItem[] | undefined = Array.isArray(body.items) && body.items.length > 0
    ? body.items : undefined;

  // Validation
  if (!client_id || !title) {
    return NextResponse.json({ error: "client_id et title sont requis" }, { status: 400 });
  }
  if (!items && amount == null) {
    return NextResponse.json({ error: "amount ou items requis" }, { status: 400 });
  }

  // Calculate amount from line items if provided
  const computedAmount = items
    ? items.reduce((sum, it) => sum + (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0), 0)
    : Number(amount);

  const qty = Math.max(1, Math.min(50, Math.floor(Number(quantity) || 1)));

  // Build base row
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const base: Record<string, any> = {
    user_id: user.id,
    client_id,
    product_id: product_id || null,
    description: description || "",
    amount: Math.round(computedAmount * 100) / 100,
    status: status || "new",
    priority: priority || "normal",
    deadline: deadline || null,
    briefing: briefing || null,
    resources: Array.isArray(resources) ? resources : [],
    category: category || null,
    external_ref: external_ref || null,
  };
  if (custom_fields) base.custom_fields = custom_fields;

  // Helper: insert line items for an order
  const insertItems = async (orderId: string) => {
    if (!items || items.length === 0) return;
    const rows = items.map((it) => ({
      order_id: orderId,
      label: it.label || "",
      description: it.description || null,
      quantity: Math.max(1, Number(it.quantity) || 1),
      unit_price: Number(it.unitPrice) || 0,
      product_id: it.productId || null,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("order_items") as any).insert(rows);
  };

  // Single order
  if (qty === 1) {
    base.title = title;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("orders") as any)
      .insert(base)
      .select("*, clients(name, email, phone), order_items(id, label, description, quantity, unit_price, product_id)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await insertItems(data.id);

    // Re-fetch to include freshly inserted items
    if (items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: refreshed } = await (supabase.from("orders") as any)
        .select("*, clients(name, email, phone), order_items(id, label, description, quantity, unit_price, product_id)")
        .eq("id", data.id)
        .single();
      return NextResponse.json(refreshed ?? data, { status: 201 });
    }

    return NextResponse.json(data, { status: 201 });
  }

  // Bulk: N rows with group_id + title suffixes
  const groupId = crypto.randomUUID();
  const rows = Array.from({ length: qty }, (_, i) => ({
    ...base,
    title: `${title} (${i + 1}/${qty})`,
    group_id: groupId,
    group_index: i + 1,
    group_total: qty,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("orders") as any)
    .insert(rows)
    .select("*, clients(name, email, phone)");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Insert items for each bulk order
  if (items && data) {
    for (const order of data) {
      await insertItems(order.id);
    }
  }

  return NextResponse.json(data, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// ── Shared select fragments ──
// Migration 055 adds label/description to order_items. Fallback if not applied yet.
const ORDER_SELECT_FULL = "*, clients(name, email, phone), order_brief_responses(order_id), order_items(id, label, description, quantity, unit_price, product_id)";
const ORDER_SELECT_LEGACY = "*, clients(name, email, phone), order_brief_responses(order_id), order_items(id, quantity, unit_price, product_id)";

// GET /api/orders — list user's orders with client+product+items join
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const source = req.nextUrl.searchParams.get("source");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildQuery = (select: string, useSortPosition = true) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q = (supabase.from("orders") as any)
      .select(select)
      .eq("user_id", user.id);
    if (useSortPosition) q = q.order("sort_position", { ascending: true });
    q = q.order("created_at", { ascending: false });
    if (source === "site") q = q.not("product_id", "is", null);
    return q;
  };

  // Try full select (with label/description from migration 055)
  let { data, error } = await buildQuery(ORDER_SELECT_FULL);

  // Fallback: if sort_position column doesn't exist yet, retry without it
  if (error && error.message?.includes("sort_position")) {
    console.warn("[GET /api/orders] sort_position column missing — Run migration 056.");
    ({ data, error } = await buildQuery(ORDER_SELECT_FULL, false));
  }

  // Fallback: if label column doesn't exist yet, retry without it
  if (error && error.message?.includes("label")) {
    console.warn("[GET /api/orders] label column missing — using legacy select. Run migration 055.");
    ({ data, error } = await buildQuery(ORDER_SELECT_LEGACY, false));
  }

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

  // ── Subscription guard: vérifier quota commandes/mois ──
  const { checkResourceQuota } = await import("@/lib/subscription-guard");
  const guard = await checkResourceQuota(supabase, user.id, "orders_per_month");
  if (!guard.allowed) {
    return NextResponse.json(
      { error: guard.error, upgrade: guard.upgrade, quotaExceeded: true },
      { status: 403 },
    );
  }

  const body = await req.json();
  const {
    client_id, product_id, title, description, amount, status, priority,
    deadline, custom_fields, briefing, resources, category, external_ref,
    quantity,
  } = body;

  // Parse line items (grouped mode)
  const items: BodyLineItem[] | undefined = Array.isArray(body.items) && body.items.length > 0
    ? body.items : undefined;

  // Parse split items (split mode — each item × qty becomes a separate order)
  const splitItems: BodyLineItem[] | undefined = Array.isArray(body.split_items) && body.split_items.length > 0
    ? body.split_items : undefined;

  // Validation
  if (!client_id || !title) {
    return NextResponse.json({ error: "client_id et title sont requis" }, { status: 400 });
  }
  if (!items && !splitItems && amount == null) {
    return NextResponse.json({ error: "amount, items ou split_items requis" }, { status: 400 });
  }

  // ══════════════════════════════════════════════════════════
  // SPLIT MODE — each line item × quantity = separate order
  // ══════════════════════════════════════════════════════════
  if (splitItems) {
    // Build one order per item × quantity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: Record<string, any>[] = [];
    const groupId = crypto.randomUUID();

    for (const item of splitItems) {
      const itemQty = Math.max(1, Math.min(50, Number(item.quantity) || 1));
      const itemPrice = Math.round((Number(item.unitPrice) || 0) * 100) / 100;
      const itemTitle = item.label || title;

      for (let i = 0; i < itemQty; i++) {
        rows.push({
          user_id: user.id,
          client_id,
          product_id: product_id || null,
          title: itemQty > 1 ? `${itemTitle} (${i + 1}/${itemQty})` : itemTitle,
          description: item.description || description || "",
          amount: itemPrice,
          status: status || "new",
          priority: priority || "normal",
          deadline: deadline || null,
          briefing: briefing || null,
          resources: Array.isArray(resources) ? resources : [],
          category: category || null,
          external_ref: external_ref || null,
          group_id: groupId,
          group_index: rows.length + 1,
          group_total: 0, // Updated after loop
          ...(custom_fields ? { custom_fields } : {}),
        });
      }
    }

    // Set correct group_total on all rows
    for (const row of rows) row.group_total = rows.length;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("orders") as any)
      .insert(rows)
      .select(ORDER_SELECT_LEGACY);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  }

  // ══════════════════════════════════════════════════════════
  // SIMPLE / GROUPED MODE
  // ══════════════════════════════════════════════════════════

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
  // Uses label/description if migration 055 is applied, otherwise inserts basic columns
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
    const { error: insertErr } = await (supabase.from("order_items") as any).insert(rows);
    if (insertErr && insertErr.message?.includes("label")) {
      // Migration 055 not applied — insert without label/description
      console.warn("[insertItems] label column missing — inserting without label/description. Run migration 055.");
      const legacyRows = items.map((it) => ({
        order_id: orderId,
        quantity: Math.max(1, Number(it.quantity) || 1),
        unit_price: Number(it.unitPrice) || 0,
        product_id: it.productId || null,
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("order_items") as any).insert(legacyRows);
    }
  };

  // Single order
  if (qty === 1) {
    base.title = title;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { data, error } = await (supabase.from("orders") as any)
      .insert(base)
      .select(ORDER_SELECT_FULL)
      .single();

    // Fallback if label column missing
    if (error && error.message?.includes("label")) {
      ({ data, error } = await (supabase.from("orders") as any)
        .insert(base)
        .select(ORDER_SELECT_LEGACY)
        .single());
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await insertItems(data.id);

    // 🔔 Notification — nouvelle commande (fire-and-forget)
    import("@/lib/notifications/triggers").then(({ triggerOrderNew }) =>
      triggerOrderNew({
        userId: user.id,
        orderId: data.id,
        orderTitle: title,
        clientName: data.clients?.name,
        amount: data.amount,
      }).catch(() => {})
    );

    // Re-fetch to include freshly inserted items
    if (items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: refreshed } = await (supabase.from("orders") as any)
        .select(ORDER_SELECT_FULL)
        .eq("id", data.id)
        .single();
      if (refreshed) return NextResponse.json(refreshed, { status: 201 });
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

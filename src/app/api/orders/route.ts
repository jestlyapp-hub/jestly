import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/orders — list user's orders with client+product join
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const source = req.nextUrl.searchParams.get("source");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("orders") as any)
    .select("*, clients(name, email, phone), products!service_id(name), order_brief_responses(order_id)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Filter by source (site orders only come from service_id not null)
  if (source === "site") {
    query = query.not("service_id", "is", null);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/orders — create one or many orders (bulk via quantity)
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const {
    client_id, service_id, title, description, amount, status, priority,
    deadline, custom_fields, briefing, resources, category, external_ref,
    quantity,
  } = body;

  if (!client_id || !title || amount == null) {
    return NextResponse.json({ error: "client_id, title and amount are required" }, { status: 400 });
  }

  const qty = Math.max(1, Math.min(50, Math.floor(Number(quantity) || 1)));

  // Build base row
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const base: Record<string, any> = {
    user_id: user.id,
    client_id,
    service_id: service_id || null,
    description: description || "",
    amount,
    status: status || "new",
    priority: priority || "normal",
    deadline: deadline || null,
    briefing: briefing || null,
    resources: Array.isArray(resources) ? resources : [],
    category: category || null,
    external_ref: external_ref || null,
  };
  if (custom_fields) base.custom_fields = custom_fields;

  // Single order
  if (qty === 1) {
    base.title = title;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("orders") as any)
      .insert(base)
      .select("*, clients(name, email, phone), products!service_id(name)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
    .select("*, clients(name, email, phone), products!service_id(name)");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { logger } from "@/lib/logger";
import { apiError, handleApiError } from "@/lib/api-error";

// GET /api/clients — list user's clients
// ?status=active|archived|all (default: active)
// ?q=search term
// ?sort=name|created_at|last_order_at|total_revenue (default: created_at)
// ?order=asc|desc (default: desc)
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const params = req.nextUrl.searchParams;
  const status = params.get("status") || "active";
  const q = params.get("q")?.trim();
  const sort = params.get("sort") || "created_at";
  const order = params.get("order") || "desc";

  const allowedSorts = ["name", "created_at", "last_order_at", "total_revenue"];
  const sortCol = allowedSorts.includes(sort) ? sort : "created_at";
  const ascending = order === "asc";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("clients") as any)
    .select("*, orders(amount, status)")
    .eq("user_id", user.id)
    .is("deleted_at", null);

  // Status filter
  if (status === "active") {
    query = query.eq("status", "active");
  } else if (status === "archived") {
    query = query.eq("status", "archived");
  }
  // status === "all" → no extra filter (active + archived, deleted already excluded)

  // Search filter
  if (q && q.length >= 1) {
    const pattern = `%${q}%`;
    query = query.or(`name.ilike.${pattern},email.ilike.${pattern},company.ilike.${pattern}`);
    query = query.limit(50);
  }

  query = query.order(sortCol, { ascending, nullsFirst: false });

  const { data, error } = await query;

  if (error) return apiError(500, error.message, { route: "/api/clients", userId: user.id });

  // Compute real revenue from orders (not from stale total_revenue column)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapped = (data || []).map((c: any) => {
    const orderRows: { amount: number; status: string }[] = Array.isArray(c.orders) ? c.orders : [];
    const activeOrders = orderRows.filter((o) => o.status !== "cancelled" && o.status !== "refunded" && o.status !== "dispute");
    const computedRevenue = activeOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
    return {
      ...c,
      orders_count: activeOrders.length,
      total_revenue: computedRevenue,
    };
  });

  return NextResponse.json(mapped);
}

// POST /api/clients — create a client (anti-doublon email)
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const {
    name,
    firstName,
    lastName,
    email,
    phone,
    company,
    website,
    tags,
    address,
    language,
    timezone,
    custom_fields: customFields,
    initialNote,
  } = body;

  const normalizedEmail = email ? email.trim().toLowerCase() : null;

  // Anti-doublon : check existing client with same email for this user
  if (normalizedEmail) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase.from("clients") as any)
      .select("id, deleted_at")
      .eq("user_id", user.id)
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (existing) {
      // If soft-deleted, restore it
      if (existing.deleted_at) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("clients") as any)
          .update({ deleted_at: null, status: "active" })
          .eq("id", existing.id);
        return NextResponse.json(
          { id: existing.id, restored: true },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: "duplicate", existingClientId: existing.id },
        { status: 409 }
      );
    }
  }

  // Build name: accept name directly, or compose from firstName + lastName
  const clientName = name || [firstName, lastName].filter(Boolean).join(" ") || normalizedEmail || "Client sans nom";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: client, error } = await (supabase.from("clients") as any)
    .insert({
      user_id: user.id,
      name: clientName,
      email: normalizedEmail || null,
      phone: phone || null,
      company: company || null,
      website: website || null,
      tags: tags || [],
      address: address || null,
      source: "manual",
      language: language || "fr",
      timezone: timezone || "Europe/Paris",
      custom_fields: customFields || {},
    })
    .select()
    .single();

  if (error) return apiError(500, error.message, { route: "/api/clients", userId: user.id, action: "create_client" });

  logger.info("client_created", { userId: user.id, entity: "client", entityId: client.id, route: "/api/clients" });

  // Insert client_created event
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("client_events") as any).insert({
    client_id: client.id,
    type: "client_created",
    payload: { source: "manual" },
  });

  // If initialNote provided, insert note + note_added event
  if (initialNote && initialNote.trim()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("client_notes") as any).insert({
      client_id: client.id,
      content: initialNote.trim(),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("client_events") as any).insert({
      client_id: client.id,
      type: "note_added",
      payload: { preview: initialNote.trim().slice(0, 100) },
    });
  }

  return NextResponse.json({ ...client, orders_count: 0 }, { status: 201 });
}

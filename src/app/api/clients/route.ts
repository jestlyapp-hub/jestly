import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

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
    .select("*, orders(count)")
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapped = (data || []).map((c: any) => ({
    ...c,
    orders_count: c.orders?.[0]?.count ?? 0,
  }));

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
      .select("id")
      .eq("user_id", user.id)
      .ilike("email", normalizedEmail)
      .is("deleted_at", null)
      .maybeSingle();

    if (existing) {
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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

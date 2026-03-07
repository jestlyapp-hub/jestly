import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/clients — list user's clients (supports ?q= search)
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const q = req.nextUrl.searchParams.get("q")?.trim();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("clients") as any)
    .select("*, orders(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (q && q.length >= 1) {
    const pattern = `%${q}%`;
    query = query.or(`name.ilike.${pattern},email.ilike.${pattern}`);
    query = query.limit(10);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Map orders count from the join
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

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Anti-doublon : check existing client with same email for this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase.from("clients") as any)
    .select("id")
    .eq("user_id", user.id)
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "duplicate", existingClientId: existing.id },
      { status: 409 }
    );
  }

  // Build name: accept name directly, or compose from firstName + lastName
  const clientName = name || [firstName, lastName].filter(Boolean).join(" ") || normalizedEmail;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: client, error } = await (supabase.from("clients") as any)
    .insert({
      user_id: user.id,
      name: clientName,
      email: normalizedEmail,
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

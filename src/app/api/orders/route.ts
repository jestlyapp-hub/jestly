import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/orders — list user's orders with client+service join
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const source = req.nextUrl.searchParams.get("source");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("orders") as any)
    .select("*, clients(name, email, phone), services(title)")
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

// POST /api/orders — create an order manually
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const { client_id, service_id, title, description, amount, status, status_id, priority, deadline, custom_fields } = body;

  if (!client_id || !title || amount == null) {
    return NextResponse.json({ error: "client_id, title and amount are required" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insert: Record<string, any> = {
    user_id: user.id,
    client_id,
    service_id: service_id || null,
    title,
    description: description || "",
    amount,
    status: status || "new",
    priority: priority || "normal",
    deadline: deadline || null,
  };
  if (status_id) insert.status_id = status_id;
  if (custom_fields) insert.custom_fields = custom_fields;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("orders") as any)
    .insert(insert)
    .select("*, clients(name, email, phone), services(title)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

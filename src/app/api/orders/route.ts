import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/orders — list user's orders with client+service join
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const source = req.nextUrl.searchParams.get("source");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("orders") as any)
    .select("*, clients(name, email), services(title)")
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { client_id, service_id, title, description, amount, status, priority, deadline } = body;

  if (!client_id || !title || amount == null) {
    return NextResponse.json({ error: "client_id, title and amount are required" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("orders") as any)
    .insert({
      user_id: user.id,
      client_id,
      service_id: service_id || null,
      title,
      description: description || "",
      amount,
      status: status || "new",
      priority: priority || "normal",
      deadline: deadline || null,
    })
    .select("*, clients(name, email), services(title)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

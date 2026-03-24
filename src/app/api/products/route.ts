import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/products — list user's services/products
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("products") as any)
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/products — create a new service/product
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const { name, description, price_cents, type, slug, short_description, long_description, features, delivery_time_days, thumbnail_url, is_featured, category, form_schema_json } = body;

  if (!name || price_cents == null || !type) {
    return NextResponse.json({ error: "Le nom, le prix et le type sont requis" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("products") as any)
    .insert({
      owner_id: user.id,
      name,
      description: description || "",
      price_cents,
      type,
      slug: slug || null,
      short_description: short_description || "",
      long_description: long_description || null,
      features: features || [],
      delivery_time_days: delivery_time_days || null,
      thumbnail_url: thumbnail_url || null,
      is_featured: is_featured || false,
      category: category || "",
      form_schema_json: form_schema_json || [],
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Ce slug est déjà utilisé. Choisissez un autre nom." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

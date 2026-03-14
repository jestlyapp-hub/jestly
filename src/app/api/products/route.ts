import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/products — list user's products
// SCHEMA: table=products (NOT services), owner_id (NOT user_id) — migration 017
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

// POST /api/products — create a new product
// SCHEMA: name (NOT title), owner_id (NOT user_id), price_cents (NOT price), status (NOT is_active)
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const {
    name, title, description, price, price_cents, type, slug,
    short_description, long_description, features, delivery_time_days,
    thumbnail_url, is_featured, category, form_schema_json,
    mode, delivery_type, delivery_file_path, delivery_url, cta_label,
    cover_image_url, status,
  } = body;

  const productName = name || title;
  if (!productName || type == null) {
    return NextResponse.json({ error: "name and type are required" }, { status: 400 });
  }

  // Support both price (euros) and price_cents (cents)
  let cents: number;
  if (price_cents != null) {
    cents = Math.round(Number(price_cents));
  } else if (price != null) {
    cents = Math.round(Number(price) * 100);
  } else {
    return NextResponse.json({ error: "price or price_cents is required" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("products") as any)
    .insert({
      owner_id: user.id,
      name: productName,
      description: description || "",
      price_cents: cents,
      type,
      status: status || "draft",
      slug: slug || null,
      short_description: short_description || "",
      long_description: long_description || null,
      features: features || [],
      delivery_time_days: delivery_time_days || null,
      thumbnail_url: thumbnail_url || null,
      is_featured: is_featured || false,
      category: category || "",
      form_schema_json: form_schema_json || [],
      mode: mode || "checkout",
      delivery_type: delivery_type || "none",
      delivery_file_path: delivery_file_path || null,
      delivery_url: delivery_url || null,
      cta_label: cta_label || "Acheter",
      cover_image_url: cover_image_url || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

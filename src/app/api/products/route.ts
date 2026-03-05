import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { slugify } from "@/lib/slug";

// GET /api/products — list user's products
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
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const {
    name, description, price_cents, type, slug, short_description, long_description,
    features, delivery_time_days, thumbnail_url, is_featured, category,
    form_schema_json, mode, delivery_type, delivery_file_path,
    delivery_url, cta_label, cover_image_url,
  } = body;

  if (!name || !type) {
    return NextResponse.json({ error: "name and type are required" }, { status: 400 });
  }

  // lead_magnet can have price=0
  const finalPriceCents = type === "lead_magnet" ? 0 : (price_cents ?? 0);

  // Auto-generate slug from name if not provided
  const autoSlug = slug || slugify(name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("products") as any)
    .insert({
      owner_id: user.id,
      name,
      description: description || "",
      price_cents: finalPriceCents,
      type,
      status: "draft",
      slug: autoSlug,
      short_description: short_description || "",
      long_description: long_description || null,
      features: features || [],
      delivery_time_days: delivery_time_days || null,
      thumbnail_url: thumbnail_url || null,
      is_featured: is_featured || false,
      category: category || "",
      form_schema_json: form_schema_json || [],
      mode: mode || (type === "lead_magnet" ? "contact" : "checkout"),
      delivery_type: delivery_type || "none",
      delivery_file_path: delivery_file_path || null,
      delivery_url: delivery_url || null,
      cta_label: cta_label || (type === "lead_magnet" ? "Obtenir" : "Acheter"),
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

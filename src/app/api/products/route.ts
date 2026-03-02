import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/products — list user's services/products
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("services") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/products — create a new service/product
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, price, type, slug, short_description, long_description, features, delivery_time_days, thumbnail_url, is_featured, category, form_schema_json } = body;

  if (!title || price == null || !type) {
    return NextResponse.json({ error: "title, price and type are required" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("services") as any)
    .insert({
      user_id: user.id,
      title,
      description: description || "",
      price,
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
      return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

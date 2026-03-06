import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/products/[id]/brief — list briefs linked to a product (M:N)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("product_briefs") as any)
    .select("*, brief_templates(id, name, version, schema)")
    .eq("product_id", id)
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

// PUT /api/products/[id]/brief — replace all briefs for a product
// Body: { briefs: [{ brief_template_id, is_default }] }
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const briefs: { brief_template_id: string; is_default?: boolean }[] = Array.isArray(body.briefs) ? body.briefs : [];

  // Ensure at most one default
  let hasDefault = false;
  for (const b of briefs) {
    if (b.is_default) {
      if (hasDefault) b.is_default = false;
      hasDefault = true;
    }
  }

  // Delete existing links
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("product_briefs") as any)
    .delete()
    .eq("product_id", id)
    .eq("owner_id", user.id);

  // Insert new links
  if (briefs.length > 0) {
    const rows = briefs.map((b) => ({
      owner_id: user.id,
      product_id: id,
      brief_template_id: b.brief_template_id,
      is_default: b.is_default ?? false,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("product_briefs") as any).insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return updated list
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error: fetchError } = await (supabase.from("product_briefs") as any)
    .select("*, brief_templates(id, name, version, schema)")
    .eq("product_id", id)
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  return NextResponse.json(data || []);
}

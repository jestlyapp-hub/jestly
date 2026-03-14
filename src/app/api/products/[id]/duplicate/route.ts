import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// POST /api/products/[id]/duplicate — duplicate a product
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // Fetch original
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: original, error: fetchErr } = await (supabase.from("products") as any)
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (fetchErr || !original) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Build copy
  const {
    id: _id, created_at: _ca, updated_at: _ua, sales_count: _sc,
    slug: originalSlug, name: originalName, ...rest
  } = original;

  const newSlug = originalSlug ? `${originalSlug}-copy` : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("products") as any)
    .insert({
      ...rest,
      owner_id: user.id,
      name: `${originalName} (copie)`,
      slug: newSlug,
      sales_count: 0,
      status: "inactive",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

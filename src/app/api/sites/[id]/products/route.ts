import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// GET /api/sites/[id]/products — list products linked to this site
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: siteId } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // Verify site ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: site } = await (supabase.from("sites") as any)
    .select("id")
    .eq("id", siteId)
    .eq("owner_id", user.id)
    .single();

  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  // Get linked product IDs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: links } = await (supabase.from("site_product_links") as any)
    .select("product_id, is_featured, sort_order")
    .eq("site_id", siteId)
    .order("sort_order");

  if (!links || links.length === 0) {
    // Return all user products (attachable)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: products } = await (supabase.from("products") as any)
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ linked: [], available: products || [] });
  }

  const linkedIds = links.map((l: { product_id: string }) => l.product_id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: linkedProducts } = await (supabase.from("products") as any)
    .select("*")
    .in("id", linkedIds);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: available } = await (supabase.from("products") as any)
    .select("*")
    .eq("owner_id", user.id)
    .not("id", "in", `(${linkedIds.join(",")})`)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    linked: linkedProducts || [],
    available: available || [],
  });
}

// POST /api/sites/[id]/products — attach or detach a product
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: siteId } = await params;
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const { productId, action } = body;

  if (!productId || !action) {
    return NextResponse.json({ error: "productId and action required" }, { status: 400 });
  }

  // Verify site ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: site } = await (supabase.from("sites") as any)
    .select("id")
    .eq("id", siteId)
    .eq("owner_id", user.id)
    .single();

  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  if (action === "attach") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("site_product_links") as any)
      .upsert({ site_id: siteId, product_id: productId }, { onConflict: "site_id,product_id" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  if (action === "detach") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("site_product_links") as any)
      .delete()
      .eq("site_id", siteId)
      .eq("product_id", productId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

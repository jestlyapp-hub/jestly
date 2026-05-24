import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integration } = await (supabase.from("integrations") as any)
    .select("id").eq("user_id", user.id).eq("provider", "shopify").eq("status", "active").maybeSingle();
  if (!integration) return NextResponse.json({ error: "Aucune intégration" }, { status: 404 });

  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const status = url.searchParams.get("status");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "60", 10), 200);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from("shopify_products") as any)
    .select("id, shopify_product_id, title, handle, status, vendor, product_type, total_inventory, price_min, price_max, featured_image_url, updated_at", { count: "exact" })
    .eq("integration_id", integration.id)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) q = q.eq("status", status);
  if (search) q = q.ilike("title", `%${search}%`);

  const { data, count } = await q;
  return NextResponse.json({ data: data ?? [], total: count ?? 0 });
}

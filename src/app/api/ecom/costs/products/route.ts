import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/ecom/costs/products — catalogue Shopify avec prix de vente et
 * coût d'achat courant (dernière version effective à aujourd'hui), pour
 * l'écran Réglages coûts (marge brute calculée en live côté client).
 */
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integ } = await (supabase.from("integrations") as any)
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("provider", "shopify")
    .eq("status", "active")
    .maybeSingle();
  if (!integ) return NextResponse.json({ products: [] });

  const [{ data: products }, { data: costs }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("shopify_products") as any)
      .select("shopify_product_id, title, featured_image_url, price_min, price_max, status")
      .eq("integration_id", integ.id)
      .order("title"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("ecom_product_costs") as any)
      .select("shopify_product_id, unit_cost_cents, effective_from")
      .eq("user_id", auth.user.id)
      .lte("effective_from", new Date().toISOString().slice(0, 10))
      .order("effective_from", { ascending: false }),
  ]);

  // Coût courant = première ligne rencontrée (tri effective_from DESC).
  const currentCost = new Map<string, number>();
  for (const c of (costs ?? []) as Array<{ shopify_product_id: string; unit_cost_cents: number }>) {
    if (!currentCost.has(c.shopify_product_id)) currentCost.set(c.shopify_product_id, c.unit_cost_cents);
  }

  return NextResponse.json({
    products: ((products ?? []) as Array<{
      shopify_product_id: string; title: string; featured_image_url: string | null;
      price_min: number | null; price_max: number | null; status: string | null;
    }>).map((p) => ({
      shopify_product_id: p.shopify_product_id,
      title: p.title,
      image_url: p.featured_image_url,
      status: p.status,
      price_cents: p.price_min != null ? Math.round(p.price_min * 100) : null,
      price_max_cents: p.price_max != null ? Math.round(p.price_max * 100) : null,
      unit_cost_cents: currentCost.get(p.shopify_product_id) ?? null,
    })),
  });
}

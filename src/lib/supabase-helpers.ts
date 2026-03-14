import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Enrich order rows with product names.
 *
 * PostgREST cannot resolve the FK `orders.product_id → products.id`
 * (migration 017 renamed the table + column, cache may be stale).
 * So we fetch products separately and merge in JS.
 *
 * This is the ONLY place where orders → products join logic lives.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function enrichOrdersWithProducts(supabase: SupabaseClient | any, orders: any[], userId: string): Promise<any[]> {
  if (!orders || orders.length === 0) return orders || [];

  // Collect unique product_ids
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productIds = [...new Set(orders.map((o: any) => o.product_id).filter(Boolean))] as string[];
  if (productIds.length === 0) {
    // No products to join — add empty products field
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return orders.map((o: any) => ({ ...o, products: null }));
  }

  // Fetch products — use owner_id (NOT user_id)
  const { data: products } = await (supabase.from("products") as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    .select("id, name, price_cents")
    .eq("owner_id", userId)
    .in("id", productIds);

  // Build lookup map
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productMap = new Map<string, { id: string; name: string; price_cents: number }>(
    (products || []).map((p: any) => [p.id, p]) // eslint-disable-line @typescript-eslint/no-explicit-any
  );

  // Merge into orders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return orders.map((o: any) => {
    const prod = o.product_id ? productMap.get(o.product_id) : undefined;
    return {
      ...o,
      products: prod ? { name: prod.name, price_cents: prod.price_cents } : null,
    };
  });
}

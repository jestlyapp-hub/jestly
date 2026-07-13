import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { resolveShopifyIntegration, requestedIntegrationId } from "@/lib/shopify/resolve-integration";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const resolved = await resolveShopifyIntegration(supabase, user.id, requestedIntegrationId(req));
  if (!resolved) return NextResponse.json({ error: "Aucune intégration" }, { status: 404 });
  const integration = resolved.integration;

  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 200);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from("shopify_customers") as any)
    .select("id, email, first_name, last_name, orders_count, total_spent, currency, accepts_marketing, created_at", { count: "exact" })
    .eq("integration_id", integration.id)
    .order("total_spent", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) q = q.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);

  const { data, count } = await q;
  return NextResponse.json({ data: data ?? [], total: count ?? 0 });
}

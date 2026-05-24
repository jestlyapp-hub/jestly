import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integration } = await (supabase.from("integrations") as any)
    .select("id")
    .eq("user_id", user.id)
    .eq("provider", "shopify")
    .eq("status", "active")
    .maybeSingle();
  if (!integration) return NextResponse.json({ error: "Aucune intégration" }, { status: 404 });

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 200);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);
  const financialStatus = url.searchParams.get("financial");
  const fulfillment = url.searchParams.get("fulfillment");
  const search = url.searchParams.get("search");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("shopify_orders") as any)
    .select(
      "id, shopify_order_id, name, created_at, total_price, currency, email, phone, financial_status, fulfillment_status, source_name, utm_source, line_items, shipping_address",
      { count: "exact" },
    )
    .eq("integration_id", integration.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (financialStatus) query = query.eq("financial_status", financialStatus);
  if (fulfillment === "unfulfilled") query = query.or("fulfillment_status.is.null,fulfillment_status.eq.unfulfilled");
  else if (fulfillment) query = query.eq("fulfillment_status", fulfillment);
  if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to + "T23:59:59");

  const { data, count } = await query;
  return NextResponse.json({ data: data ?? [], total: count ?? 0 });
}

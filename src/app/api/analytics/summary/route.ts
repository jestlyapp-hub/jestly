import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { isRevenueOrder, getOrderDate } from "@/lib/business-metrics";

/* eslint-disable @typescript-eslint/no-explicit-any */

// GET /api/analytics/summary?siteId=xxx — analytics scoped to a specific site
// If no siteId → global account analytics (backward compat)
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const siteId = req.nextUrl.searchParams.get("siteId");

  try {
    let allOrders: any[] = [];

    if (siteId) {
      // ── SITE-SCOPED: orders linked to this site via product → site_product_links ──

      // Verify site ownership
      const { data: site } = await (supabase.from("sites") as any)
        .select("id")
        .eq("id", siteId)
        .eq("owner_id", user.id)
        .single();

      if (!site) {
        return NextResponse.json({ error: "Site not found" }, { status: 404 });
      }

      // Get product IDs linked to this site
      const { data: links } = await (supabase.from("site_product_links") as any)
        .select("product_id")
        .eq("site_id", siteId);

      const productIds = (links || []).map((l: any) => l.product_id);

      if (productIds.length > 0) {
        // Orders that have a product_id linked to this site
        const { data: siteOrders } = await (supabase.from("orders") as any)
          .select("id, amount, status, created_at, paid_at, client_id")
          .eq("user_id", user.id)
          .in("product_id", productIds)
          .order("created_at", { ascending: true });
        allOrders = siteOrders || [];
      }

      // Also include orders created via public checkout (they have product_id from this site's products)
      // Already covered above since checkout sets product_id

      // Count leads for this site specifically
      const { count: leadCount } = await (supabase.from("leads") as any)
        .select("id", { count: "exact", head: true })
        .eq("site_id", siteId);

      // Count distinct clients from site orders
      const clientIds = new Set(allOrders.map((o: any) => o.client_id).filter(Boolean));

      // Compute stats — REVENUE_STATUSES uniquement (paid/invoiced/delivered)
      const revenueOrders = allOrders.filter((o: any) => isRevenueOrder(o.status));
      const totalRevenue = revenueOrders.reduce((s: number, o: any) => s + (Number(o.amount) || 0), 0);
      const totalOrders = revenueOrders.length;
      const avgBasket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

      // Monthly
      const months = buildMonthlyData(allOrders);

      console.log(`[ANALYTICS SUMMARY] site=${siteId} | products=${productIds.length} | orders=${totalOrders} | revenue=${totalRevenue} | clients=${clientIds.size} | leads=${leadCount || 0}`);

      return NextResponse.json({
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        clientCount: clientIds.size,
        leadCount: leadCount || 0,
        avgBasket,
        months,
      });
    }

    // ── GLOBAL (no siteId — backward compat for account-level analytics) ──
    const { data: orders } = await (supabase.from("orders") as any)
      .select("id, amount, status, created_at, paid_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    allOrders = orders || [];

    // Revenue = REVENUE_STATUSES uniquement (paid/invoiced/delivered)
    const revenueOrders = allOrders.filter((o: any) => isRevenueOrder(o.status));
    const totalRevenue = revenueOrders.reduce((sum: number, o: any) => sum + (Number(o.amount) || 0), 0);
    const totalOrders = revenueOrders.length;

    const { count: clientCount } = await (supabase.from("clients") as any)
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const avgBasket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const months = buildMonthlyData(allOrders);

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      clientCount: clientCount || 0,
      avgBasket,
      months,
    });
  } catch (err) {
    console.error("Analytics summary error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function buildMonthlyData(orders: any[]): { month: string; revenue: number; orders: number }[] {
  const months: { month: string; revenue: number; orders: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = d.toISOString();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
    // Utiliser REVENUE_STATUSES + getOrderDate (paid_at avec fallback created_at)
    const monthOrders = orders.filter(
      (o: any) => {
        if (!isRevenueOrder(o.status)) return false;
        const dateRef = getOrderDate(o);
        return dateRef >= start && dateRef < end;
      }
    );
    months.push({
      month: d.toLocaleDateString("fr-FR", { month: "short" }),
      revenue: Math.round(monthOrders.reduce((s: number, o: any) => s + (Number(o.amount) || 0), 0) * 100) / 100,
      orders: monthOrders.length,
    });
  }
  return months;
}

import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { enrichOrdersWithProducts } from "@/lib/supabase-helpers";

// ═══════════════════════════════════════════════════════════
// GET /api/analytics/advanced
//
// APPROACH: Use EXACTLY the same query as /api/orders (which works),
// then compute all analytics from that single source of truth.
// No separate queries, no divergent filters, no silent failures.
// ═══════════════════════════════════════════════════════════
export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const url = new URL(req.url);
  const range = url.searchParams.get("range") || "30d";
  const customFrom = url.searchParams.get("from");
  const customTo = url.searchParams.get("to");
  const debug = url.searchParams.get("debug") === "1";

  try {
    // ══════════════════════════════════════════════════════════
    // STEP 1: Fetch ALL orders — SAME query as /api/orders GET
    // This is the query that the Commandes page uses and works.
    // ══════════════════════════════════════════════════════════
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: rawOrders, error: ordersErr } = await (supabase.from("orders") as any)
      .select("*, clients(name, email, phone), order_brief_responses(order_id)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (ordersErr) {
      console.error("[ANALYTICS] ❌ Orders query FAILED:", ordersErr.message, ordersErr.details, ordersErr.hint);
      return NextResponse.json({
        error: `Orders query failed: ${ordersErr.message}`,
        _debug: { userId: user.id, errorCode: ordersErr.code, errorDetails: ordersErr.details },
      }, { status: 500 });
    }

    // Enrich with products (same as /api/orders)
    const allOrders = await enrichOrdersWithProducts(supabase, rawOrders || [], user.id);

    // Fetch clients for customer analytics
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: allClients } = await (supabase.from("clients") as any)
      .select("id, name, email, created_at")
      .eq("user_id", user.id);

    const clients = allClients || [];

    console.log(`[ANALYTICS] ✅ Fetched ${allOrders.length} orders, ${clients.length} clients for user ${user.id}`);

    // ══════════════════════════════════════════════════════════
    // STEP 2: Compute date range and filter orders
    // ══════════════════════════════════════════════════════════
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (range) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 86400000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 86400000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 86400000);
        break;
      case "12m":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case "all":
        startDate = new Date(2020, 0, 1);
        break;
      case "custom":
        startDate = customFrom ? new Date(customFrom) : new Date(now.getTime() - 30 * 86400000);
        if (customTo) endDate = new Date(customTo);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 86400000);
    }

    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Previous period for comparison
    const periodMs = endDate.getTime() - startDate.getTime();
    const prevStartISO = new Date(startDate.getTime() - periodMs).toISOString();

    // Filter orders by date range — use created_at (same as Commandes page)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orders = allOrders.filter((o: any) =>
      o.created_at >= startISO && o.created_at <= endISO
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prevOrders = allOrders.filter((o: any) =>
      o.created_at >= prevStartISO && o.created_at < startISO
    );

    console.log(`[ANALYTICS] range=${range} | ${startISO.slice(0,10)}..${endISO.slice(0,10)} | period orders=${orders.length} | prev=${prevOrders.length} | total=${allOrders.length}`);

    // ══════════════════════════════════════════════════════════
    // STEP 3: Compute all analytics from the filtered orders
    // ══════════════════════════════════════════════════════════

    // Helper: safe number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const num = (v: any): number => Number(v) || 0;

    // ── Categorize orders ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isActive = (o: any) => o.status !== "cancelled" && o.status !== "refunded" && o.status !== "dispute";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isPaid = (o: any) => o.status === "paid" || o.status === "delivered" || o.status === "invoiced";

    const activeOrders = orders.filter(isActive);
    const prevActiveOrders = prevOrders.filter(isActive);
    const paidOrders = orders.filter(isPaid);
    const refundedOrders = orders.filter((o: { status: string }) => o.status === "refunded");

    // ── Funnel data from analytics_events (REAL tracking) ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userSites } = await (supabase.from("sites") as any)
      .select("id")
      .eq("owner_id", user.id);
    const siteIds = (userSites || []).map((s: { id: string }) => s.id);
    const funnelData = { pageViews: 0, productViews: 0, checkoutsStarted: 0, ordersCompleted: activeOrders.length, hasRealData: false };

    if (siteIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: events, error: eventsErr } = await (supabase.from("analytics_events") as any)
        .select("type")
        .in("site_id", siteIds)
        .gte("created_at", startISO)
        .lte("created_at", endISO);
      if (eventsErr) console.error("[ANALYTICS] analytics_events query failed:", eventsErr.message);
      if (events && events.length > 0) {
        funnelData.hasRealData = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        events.forEach((e: any) => {
          switch (e.type) {
            case "page_view": funnelData.pageViews++; break;
            case "click_cta": funnelData.productViews++; break;
            case "order_start": funnelData.checkoutsStarted++; break;
            case "order_complete": funnelData.ordersCompleted++; break;
          }
        });
      }
    }

    // ── KPIs ──
    // Total revenue = sum of ALL active orders (not just paid, as a freelancer considers all non-cancelled orders as revenue pipeline)
    const totalRevenue = activeOrders.reduce((s: number, o: { amount: number }) => s + num(o.amount), 0);
    const prevRevenue = prevActiveOrders.reduce((s: number, o: { amount: number }) => s + num(o.amount), 0);
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Net profit = revenue - refunds
    const refundAmount = refundedOrders.reduce((s: number, o: { amount: number }) => s + num(o.amount), 0);
    const netProfit = totalRevenue - refundAmount;
    const prevRefunds = prevOrders.filter((o: { status: string }) => o.status === "refunded").reduce((s: number, o: { amount: number }) => s + num(o.amount), 0);
    const prevNetProfit = prevRevenue - prevRefunds;
    const profitChange = prevNetProfit > 0 ? ((netProfit - prevNetProfit) / prevNetProfit) * 100 : 0;

    // Orders count
    const totalOrderCount = activeOrders.length;
    const prevOrderCount = prevActiveOrders.length;
    const ordersChange = prevOrderCount > 0 ? ((totalOrderCount - prevOrderCount) / prevOrderCount) * 100 : 0;

    // AOV
    const avgOrderValue = totalOrderCount > 0 ? Math.round(totalRevenue / totalOrderCount) : 0;
    const prevAvg = prevActiveOrders.length > 0 ? Math.round(prevRevenue / prevActiveOrders.length) : 0;
    const aovChange = prevAvg > 0 ? ((avgOrderValue - prevAvg) / prevAvg) * 100 : 0;

    // Conversion rate = paid / total
    const conversionRate = orders.length > 0 ? Math.round((paidOrders.length / orders.length) * 100) : 0;
    const prevPaid = prevOrders.filter(isPaid);
    const prevConversion = prevOrders.length > 0 ? Math.round((prevPaid.length / prevOrders.length) * 100) : 0;
    const conversionChange = conversionRate - prevConversion;

    // Refund rate
    const refundRate = (activeOrders.length + refundedOrders.length) > 0
      ? Math.round((refundedOrders.length / (activeOrders.length + refundedOrders.length)) * 100 * 10) / 10
      : 0;

    // Active clients
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uniqueClientIds = new Set(activeOrders.map((o: any) => o.client_id).filter(Boolean));
    const activeClients = uniqueClientIds.size;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prevUniqueClients = new Set(prevActiveOrders.map((o: any) => o.client_id).filter(Boolean));
    const clientsChange = prevUniqueClients.size > 0 ? ((activeClients - prevUniqueClients.size) / prevUniqueClients.size) * 100 : 0;

    // Returning customers
    const clientOrderCount = new Map<string, number>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeOrders.forEach((o: any) => {
      if (o.client_id) clientOrderCount.set(o.client_id, (clientOrderCount.get(o.client_id) || 0) + 1);
    });
    const returningCount = [...clientOrderCount.values()].filter((c) => c > 1).length;
    const returningRate = activeClients > 0 ? Math.round((returningCount / activeClients) * 100) : 0;

    // ── Time Series ──
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);
    let timeSeries: { label: string; revenue: number; orders: number; profit: number }[] = [];

    if (diffDays <= 1) {
      // Hourly
      timeSeries = Array.from({ length: 24 }, (_, i) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hourOrders = activeOrders.filter((o: any) => new Date(o.created_at).getHours() === i);
        const rev = hourOrders.reduce((s: number, o: { amount: number }) => s + num(o.amount), 0);
        return { label: `${i}h`, revenue: Math.round(rev * 100) / 100, orders: hourOrders.length, profit: Math.round(rev * 100) / 100 };
      });
    } else if (diffDays <= 90) {
      // Daily
      const cursor = new Date(startDate);
      while (cursor <= endDate) {
        const dayStr = cursor.toISOString().slice(0, 10);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dayOrders = activeOrders.filter((o: any) => o.created_at?.slice(0, 10) === dayStr);
        const rev = dayOrders.reduce((s: number, o: { amount: number }) => s + num(o.amount), 0);
        timeSeries.push({
          label: cursor.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
          revenue: Math.round(rev * 100) / 100,
          orders: dayOrders.length,
          profit: Math.round(rev * 100) / 100,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
    } else {
      // Monthly
      const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      while (cursor <= endDate) {
        const mStart = cursor.toISOString();
        const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        const mEnd = next.toISOString();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const monthOrders = activeOrders.filter((o: any) => o.created_at >= mStart && o.created_at < mEnd);
        const rev = monthOrders.reduce((s: number, o: { amount: number }) => s + num(o.amount), 0);
        timeSeries.push({
          label: cursor.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
          revenue: Math.round(rev * 100) / 100,
          orders: monthOrders.length,
          profit: Math.round(rev * 100) / 100,
        });
        cursor.setMonth(cursor.getMonth() + 1);
      }
    }

    // ── Revenue by day of week ──
    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const revenueByDay = dayNames.map((name) => ({ name, revenue: 0, orders: 0 }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeOrders.forEach((o: any) => {
      const day = new Date(o.created_at).getDay();
      revenueByDay[day].revenue += num(o.amount);
      revenueByDay[day].orders += 1;
    });
    revenueByDay.forEach((d) => { d.revenue = Math.round(d.revenue * 100) / 100; });

    // ── Revenue by hour ──
    const revenueByHour = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}h`, revenue: 0, orders: 0 }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeOrders.forEach((o: any) => {
      const hour = new Date(o.created_at).getHours();
      revenueByHour[hour].revenue += num(o.amount);
      revenueByHour[hour].orders += 1;
    });
    revenueByHour.forEach((h) => { h.revenue = Math.round(h.revenue * 100) / 100; });

    // ── Product Performance ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const byProduct = new Map<string, { name: string; revenue: number; orders: number; refunds: number }>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeOrders.forEach((o: any) => {
      const key = o.product_id || "no_product";
      const name = o.products?.name || o.title || "Sans produit";
      const entry = byProduct.get(key) || { name, revenue: 0, orders: 0, refunds: 0 };
      entry.revenue += num(o.amount);
      entry.orders += 1;
      byProduct.set(key, entry);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    refundedOrders.forEach((o: any) => {
      const key = o.product_id || "no_product";
      const entry = byProduct.get(key);
      if (entry) entry.refunds += 1;
    });
    const productPerformance = [...byProduct.values()]
      .map((p) => ({
        name: p.name,
        revenue: Math.round(p.revenue * 100) / 100,
        orders: p.orders,
        refunds: p.refunds,
        avgPrice: p.orders > 0 ? Math.round(p.revenue / p.orders) : 0,
        refundRate: p.orders > 0 ? Math.round((p.refunds / p.orders) * 100) : 0,
        revenueShare: totalRevenue > 0 ? Math.round((p.revenue / totalRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Check if any orders actually have product_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ordersWithProduct = activeOrders.filter((o: any) => o.product_id).length;
    const productsLinked = ordersWithProduct > 0;

    // ── Top Clients ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const byClient = new Map<string, { name: string; email: string; revenue: number; orders: number; lastPurchase: string }>();
    const clientLookup = new Map<string, { id: string; name: string; email: string }>(
      clients.map((c: { id: string; name: string; email: string }) => [c.id, c])
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeOrders.forEach((o: any) => {
      const cid = o.client_id || "unknown";
      const clientJoin = o.clients; // from nested select
      const clientDb = clientLookup.get(cid);
      const name = clientJoin?.name || clientDb?.name || "Anonyme";
      const email = clientJoin?.email || clientDb?.email || "";
      const entry = byClient.get(cid) || { name, email, revenue: 0, orders: 0, lastPurchase: o.created_at };
      entry.revenue += num(o.amount);
      entry.orders += 1;
      if (o.created_at > entry.lastPurchase) entry.lastPurchase = o.created_at;
      byClient.set(cid, entry);
    });
    const topClients = [...byClient.values()]
      .map((c) => ({ ...c, revenue: Math.round(c.revenue * 100) / 100 }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // ── Customer Analytics ──
    const newCustomers = clients.filter(
      (c: { created_at: string }) => c.created_at >= startISO && c.created_at <= endISO
    ).length;
    const prevNewCustomers = clients.filter(
      (c: { created_at: string }) => c.created_at >= prevStartISO && c.created_at < startISO
    ).length;
    const newCustomersChange = prevNewCustomers > 0
      ? Math.round(((newCustomers - prevNewCustomers) / prevNewCustomers) * 100) : 0;

    // Customer segments
    const clientRevenues = [...byClient.entries()];
    const customerSegments = [
      { segment: "Premium (>1000€)", count: clientRevenues.filter(([, c]) => c.revenue >= 1000).length, revenue: Math.round(clientRevenues.filter(([, c]) => c.revenue >= 1000).reduce((s, [, c]) => s + c.revenue, 0) * 100) / 100 },
      { segment: "Standard (200-1000€)", count: clientRevenues.filter(([, c]) => c.revenue >= 200 && c.revenue < 1000).length, revenue: Math.round(clientRevenues.filter(([, c]) => c.revenue >= 200 && c.revenue < 1000).reduce((s, [, c]) => s + c.revenue, 0) * 100) / 100 },
      { segment: "Découverte (<200€)", count: clientRevenues.filter(([, c]) => c.revenue < 200).length, revenue: Math.round(clientRevenues.filter(([, c]) => c.revenue < 200).reduce((s, [, c]) => s + c.revenue, 0) * 100) / 100 },
    ];

    // ── Payment Methods ──
    const paymentMethods = activeOrders.length > 0
      ? [{ method: "stripe", count: activeOrders.length, revenue: Math.round(totalRevenue * 100) / 100 }]
      : [];

    // ── Monthly Growth (all orders, no date filter) ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allActive = allOrders.filter((o: any) => isActive(o));
    const monthMap = new Map<string, { month: string; revenue: number; orders: number; clients: Set<string> }>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allActive.forEach((o: any) => {
      const key = o.created_at?.slice(0, 7) || "unknown";
      const d = new Date(o.created_at);
      const entry = monthMap.get(key) || {
        month: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
        revenue: 0, orders: 0, clients: new Set<string>(),
      };
      entry.revenue += num(o.amount);
      entry.orders += 1;
      if (o.client_id) entry.clients.add(o.client_id);
      monthMap.set(key, entry);
    });
    const sorted = [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b));
    const monthlyGrowth = sorted.map(([, v], i) => {
      const prev = i > 0 ? sorted[i - 1][1] : null;
      return {
        month: v.month,
        revenue: Math.round(v.revenue * 100) / 100,
        orders: v.orders,
        clients: v.clients.size,
        revenueGrowth: prev && prev.revenue > 0 ? Math.round(((v.revenue - prev.revenue) / prev.revenue) * 100) : 0,
        orderGrowth: prev && prev.orders > 0 ? Math.round(((v.orders - prev.orders) / prev.orders) * 100) : 0,
      };
    });

    // Best / worst months
    const validMonths = monthlyGrowth.filter((m) => m.revenue > 0);
    const bestMonth = validMonths.length > 0 ? validMonths.reduce((best, m) => (m.revenue > best.revenue ? m : best)) : null;
    const worstMonth = validMonths.length > 0 ? validMonths.reduce((worst, m) => (m.revenue < worst.revenue ? m : worst)) : null;

    // ── Forecast ──
    const recent = monthlyGrowth.slice(-6);
    let forecast = { nextMonth: 0, trend: "stable" as string, confidence: 0, avgGrowthRate: 0 };
    if (recent.length >= 2) {
      const values = recent.map((m) => m.revenue);
      const n = values.length;
      const sumX = (n * (n - 1)) / 2;
      const sumY = values.reduce((a, b) => a + b, 0);
      const sumXY = values.reduce((s, y, x) => s + x * y, 0);
      const sumX2 = Array.from({ length: n }, (_, i) => i * i).reduce((a, b) => a + b, 0);
      const denom = n * sumX2 - sumX * sumX;
      if (denom !== 0) {
        const slope = (n * sumXY - sumX * sumY) / denom;
        const intercept = (sumY - slope * sumX) / n;
        const predicted = Math.round(Math.max(0, intercept + slope * n));
        const avgGrowth = recent[0].revenue > 0 ? ((recent[recent.length - 1].revenue - recent[0].revenue) / recent[0].revenue) * 100 : 0;
        forecast = {
          nextMonth: predicted,
          trend: slope > 50 ? "up" : slope < -50 ? "down" : "stable",
          confidence: Math.min(95, Math.max(30, recent.length * 15)),
          avgGrowthRate: Math.round(avgGrowth),
        };
      }
    }

    // ── Insights ──
    const insights: string[] = [];
    if (revenueChange > 5) insights.push(`Tu as gagné ${Math.round(revenueChange)}% de plus que la période précédente`);
    if (revenueChange < -5) insights.push(`Ton revenu a baissé de ${Math.abs(Math.round(revenueChange))}% par rapport à la période précédente`);
    if (productPerformance.length > 0 && productPerformance[0].revenueShare > 0) {
      insights.push(`${productPerformance[0].name} est ton produit le plus performant (${productPerformance[0].revenueShare}% du CA)`);
    }
    const bestDay = revenueByDay.reduce((best, d) => (d.revenue > best.revenue ? d : best), revenueByDay[0]);
    if (bestDay?.orders > 0) insights.push(`Ton meilleur jour de vente est le ${bestDay.name}`);
    if (avgOrderValue > 0) insights.push(`Ton panier moyen est de ${avgOrderValue} €`);
    if (returningRate > 30) insights.push(`${returningRate}% de tes clients reviennent — excellente rétention !`);

    // ── Recent Events ──
    const recentEvents = orders
      .slice(-15)
      .reverse()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((o: any) => ({
        type: o.status === "refunded" ? "refund" : "order",
        amount: num(o.amount),
        clientName: o.clients?.name || "Client",
        date: o.created_at,
        status: o.status,
      }));

    // ══════════════════════════════════════════════════════════
    // STEP 4: Build response
    // ══════════════════════════════════════════════════════════
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: Record<string, any> = {
      kpis: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        revenueChange: Math.round(revenueChange * 10) / 10,
        netProfit: Math.round(netProfit * 100) / 100,
        profitChange: Math.round(profitChange * 10) / 10,
        totalOrders: totalOrderCount,
        ordersChange: Math.round(ordersChange * 10) / 10,
        conversionRate,
        conversionChange,
        avgOrderValue,
        aovChange: Math.round(aovChange * 10) / 10,
        returningRate,
        refundRate,
        activeClients,
        clientsChange: Math.round(clientsChange * 10) / 10,
      },
      timeSeries,
      prevTimeSeries: [], // Simplified — prev period comparison
      productPerformance,
      productsLinked, // true if any orders have product_id
      topClients,
      revenueByDay,
      revenueByHour,
      customerAnalytics: {
        newCustomers,
        newCustomersChange,
        returningCustomers: returningCount,
        segments: customerSegments,
      },
      paymentMethods,
      insights,
      monthlyGrowth,
      bestMonth,
      worstMonth,
      forecast,
      profitBreakdown: {
        revenue: Math.round(totalRevenue * 100) / 100,
        fees: 0,
        refunds: Math.round(refundAmount * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
      },
      recentEvents,
      funnel: funnelData,
    };

    // ── Debug ──
    if (debug) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const statusBreakdown: Record<string, number> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allOrders.forEach((o: any) => { statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1; });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const periodStatusBreakdown: Record<string, number> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orders.forEach((o: any) => { periodStatusBreakdown[o.status] = (periodStatusBreakdown[o.status] || 0) + 1; });

      response._debug = {
        userId: user.id,
        userEmail: user.email,
        range,
        dateRange: { start: startISO.slice(0, 10), end: endISO.slice(0, 10) },
        totalOrdersAllTime: allOrders.length,
        ordersInPeriod: orders.length,
        ordersInPrevPeriod: prevOrders.length,
        clientsTotal: clients.length,
        statusBreakdownAllTime: statusBreakdown,
        statusBreakdownPeriod: periodStatusBreakdown,
        ordersWithProductId: ordersWithProduct,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sampleOrders: allOrders.slice(0, 3).map((o: any) => ({
          id: o.id,
          title: o.title,
          amount: o.amount,
          status: o.status,
          created_at: o.created_at,
          client_id: o.client_id,
          product_id: o.product_id,
          clientName: o.clients?.name,
          productName: o.title,
        })),
      };
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error("[ANALYTICS] ❌ Fatal error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

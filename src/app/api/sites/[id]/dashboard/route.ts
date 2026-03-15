import { NextResponse, type NextRequest } from "next/server";
import { getAuthUser } from "@/lib/api-auth";

// ═══════════════════════════════════════════════════════════
// GET /api/sites/[id]/dashboard
//
// Returns real dashboard stats for a specific site:
// visits, conversion, avgBasket, ctaClickRate, recentOrders,
// siteStatus, lastPublishedAt, totalRevenue, totalOrders, totalLeads
// ═══════════════════════════════════════════════════════════

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { id: siteId } = await params;

  try {
    // ── Verify ownership ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: site, error: siteErr } = await (supabase.from("sites") as any)
      .select("id, owner_id, status, settings")
      .eq("id", siteId)
      .single();

    if (siteErr || !site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }
    if (site.owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── Period calculation ──
    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "30d";

    const now = new Date();
    const days = range === "7d" ? 7 : 30;
    const periodMs = days * 86400000;

    const currentStart = new Date(now.getTime() - periodMs);
    const prevStart = new Date(currentStart.getTime() - periodMs);

    const currentStartISO = currentStart.toISOString();
    const prevStartISO = prevStart.toISOString();
    const nowISO = now.toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const num = (v: any): number => Number(v) || 0;

    // ══════════════════════════════════════════════════════════
    // VISITS — distinct visitor_id from analytics_events
    // ══════════════════════════════════════════════════════════

    // Current period page views
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentPageViews } = await (supabase.from("analytics_events") as any)
      .select("visitor_id")
      .eq("site_id", siteId)
      .eq("type", "page_view")
      .gte("created_at", currentStartISO)
      .lte("created_at", nowISO);

    // Previous period page views
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prevPageViews } = await (supabase.from("analytics_events") as any)
      .select("visitor_id")
      .eq("site_id", siteId)
      .eq("type", "page_view")
      .gte("created_at", prevStartISO)
      .lt("created_at", currentStartISO);

    const currentVisitors = new Set(
      (currentPageViews || []).map((e: { visitor_id: string }) => e.visitor_id).filter(Boolean)
    );
    const prevVisitors = new Set(
      (prevPageViews || []).map((e: { visitor_id: string }) => e.visitor_id).filter(Boolean)
    );

    const visits = currentVisitors.size;
    const prevVisits = prevVisitors.size;

    // ══════════════════════════════════════════════════════════
    // CTA CLICK RATE — click_cta / page_view in current period
    // ══════════════════════════════════════════════════════════

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentCtaClicks } = await (supabase.from("analytics_events") as any)
      .select("id")
      .eq("site_id", siteId)
      .eq("type", "click_cta")
      .gte("created_at", currentStartISO)
      .lte("created_at", nowISO);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prevCtaClicks } = await (supabase.from("analytics_events") as any)
      .select("id")
      .eq("site_id", siteId)
      .eq("type", "click_cta")
      .gte("created_at", prevStartISO)
      .lt("created_at", currentStartISO);

    const currentPageViewCount = (currentPageViews || []).length;
    const prevPageViewCount = (prevPageViews || []).length;
    const currentCtaCount = (currentCtaClicks || []).length;
    const prevCtaCount = (prevCtaClicks || []).length;

    const ctaClickRate = currentPageViewCount > 0
      ? Math.round((currentCtaCount / currentPageViewCount) * 1000) / 10
      : 0;
    const prevCtaClickRate = prevPageViewCount > 0
      ? Math.round((prevCtaCount / prevPageViewCount) * 1000) / 10
      : 0;

    // ══════════════════════════════════════════════════════════
    // ORDERS — user_id matches site owner, filtered by period
    // ══════════════════════════════════════════════════════════

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isActive = (o: any) =>
      o.status !== "cancelled" && o.status !== "refunded" && o.status !== "dispute";

    // Current period orders
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentOrders } = await (supabase.from("orders") as any)
      .select("id, amount, status, created_at, client_id, service_id, title, clients(name, email)")
      .eq("user_id", user.id)
      .gte("created_at", currentStartISO)
      .lte("created_at", nowISO)
      .order("created_at", { ascending: false });

    // Previous period orders
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prevOrders } = await (supabase.from("orders") as any)
      .select("id, amount, status")
      .eq("user_id", user.id)
      .gte("created_at", prevStartISO)
      .lt("created_at", currentStartISO);

    const activeCurrentOrders = (currentOrders || []).filter(isActive);
    const activePrevOrders = (prevOrders || []).filter(isActive);

    const totalOrders = activeCurrentOrders.length;
    const prevTotalOrders = activePrevOrders.length;

    const totalRevenue = activeCurrentOrders.reduce(
      (s: number, o: { amount: number }) => s + num(o.amount), 0
    );
    const prevTotalRevenue = activePrevOrders.reduce(
      (s: number, o: { amount: number }) => s + num(o.amount), 0
    );

    const avgBasket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const prevAvgBasket = prevTotalOrders > 0
      ? Math.round(prevTotalRevenue / prevTotalOrders) : 0;

    // ══════════════════════════════════════════════════════════
    // CONVERSION — orders completed / unique visitors
    // ══════════════════════════════════════════════════════════

    const conversion = visits > 0
      ? Math.round((totalOrders / visits) * 1000) / 10
      : 0;
    const prevConversion = prevVisits > 0
      ? Math.round((prevTotalOrders / prevVisits) * 1000) / 10
      : 0;

    // ══════════════════════════════════════════════════════════
    // RECENT ORDERS — last 5 with product name
    // ══════════════════════════════════════════════════════════

    const last5 = (currentOrders || []).slice(0, 5);

    // Fetch product names for those orders
    const serviceIds = [...new Set(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      last5.map((o: any) => o.service_id).filter(Boolean)
    )];

    let productsMap = new Map<string, string>();
    if (serviceIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: products } = await (supabase.from("products") as any)
        .select("id, name")
        .in("id", serviceIds);
      if (products) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        products.forEach((p: any) => productsMap.set(p.id, p.name));
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentOrders = last5.map((o: any) => ({
      id: o.id,
      clientName: o.clients?.name || "Anonyme",
      productName: productsMap.get(o.service_id) || o.title || "Sans produit",
      amount: num(o.amount),
      status: o.status,
      date: o.created_at,
    }));

    // ══════════════════════════════════════════════════════════
    // SITE STATUS
    // ══════════════════════════════════════════════════════════

    let siteStatus: "published" | "draft" | "maintenance" = site.status || "draft";
    if (site.settings?.maintenanceMode) {
      siteStatus = "maintenance";
    }

    // ══════════════════════════════════════════════════════════
    // LEADS — count from leads table
    // ══════════════════════════════════════════════════════════

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentLeads } = await (supabase.from("leads") as any)
      .select("id")
      .eq("site_id", siteId)
      .gte("created_at", currentStartISO)
      .lte("created_at", nowISO);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prevLeads } = await (supabase.from("leads") as any)
      .select("id")
      .eq("site_id", siteId)
      .gte("created_at", prevStartISO)
      .lt("created_at", currentStartISO);

    const totalLeads = (currentLeads || []).length;
    const prevTotalLeads = (prevLeads || []).length;

    // ══════════════════════════════════════════════════════════
    // LAST PUBLISHED — from site_published_snapshots
    // ══════════════════════════════════════════════════════════

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: lastSnapshot } = await (supabase.from("site_published_snapshots") as any)
      .select("published_at")
      .eq("site_id", siteId)
      .order("published_at", { ascending: false })
      .limit(1)
      .single();

    const lastPublishedAt = lastSnapshot?.published_at || null;

    // ══════════════════════════════════════════════════════════
    // RESPONSE
    // ══════════════════════════════════════════════════════════

    return NextResponse.json({
      visits: { value: visits, previousValue: prevVisits },
      conversion: { value: conversion, previousValue: prevConversion },
      avgBasket: { value: avgBasket, previousValue: prevAvgBasket },
      ctaClickRate: { value: ctaClickRate, previousValue: prevCtaClickRate },
      recentOrders,
      siteStatus,
      lastPublishedAt,
      totalRevenue,
      totalOrders,
      totalLeads,
      _period: {
        range,
        currentStart: currentStartISO.slice(0, 10),
        currentEnd: nowISO.slice(0, 10),
        prevStart: prevStartISO.slice(0, 10),
        prevEnd: currentStartISO.slice(0, 10),
      },
    });
  } catch (err) {
    console.error("[SITE-DASHBOARD] Fatal error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

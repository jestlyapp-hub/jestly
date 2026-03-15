import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  logAdminAction,
  checkAdminRateLimit,
  ADMIN_ACTIONS,
} from "@/lib/admin";

// GET — Growth analytics dashboard
export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user } = auth;

  const rateLimitResponse = checkAdminRateLimit(user.id, "growth_dashboard", 20);
  if (rateLimitResponse) {
    await logAdminAction(user.id, ADMIN_ACTIONS.RATE_LIMIT_HIT, undefined, { endpoint: "growth_dashboard" });
    return rateLimitResponse;
  }

  const supabase = auth.adminClient;
  const url = new URL(req.url);

  // Date range (default last 30 days)
  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setDate(defaultStart.getDate() - 30);

  const startDate = url.searchParams.get("start_date") || defaultStart.toISOString().split("T")[0];
  const endDate = url.searchParams.get("end_date") || now.toISOString().split("T")[0];
  const campaignId = url.searchParams.get("campaign_id") || "";
  const channel = url.searchParams.get("channel") || "";

  const startIso = `${startDate}T00:00:00.000Z`;
  const endIso = `${endDate}T23:59:59.999Z`;

  // ── 1. Fetch leads in date range ──
  let leadsQuery = (supabase.from("leads") as any)
    .select("id, utm_source, referrer, campaign_id, first_touch_campaign_id, last_touch_campaign_id, landing_page_id, created_at")
    .gte("created_at", startIso)
    .lte("created_at", endIso);

  if (campaignId) {
    leadsQuery = leadsQuery.or(
      `campaign_id.eq.${campaignId},first_touch_campaign_id.eq.${campaignId},last_touch_campaign_id.eq.${campaignId}`,
    );
  }

  // ── 2. Fetch conversions in date range ──
  let conversionsQuery = (supabase.from("lead_conversions") as any)
    .select("id, conversion_type, first_touch_campaign_id, last_touch_campaign_id, revenue_cents, created_at")
    .gte("created_at", startIso)
    .lte("created_at", endIso);

  if (campaignId) {
    conversionsQuery = conversionsQuery.or(
      `first_touch_campaign_id.eq.${campaignId},last_touch_campaign_id.eq.${campaignId}`,
    );
  }

  // ── 3. Fetch campaigns for channel filter + attribution ──
  let campaignsQuery = (supabase.from("campaigns") as any)
    .select("id, name, channel, budget_spent, status");

  if (channel) {
    campaignsQuery = campaignsQuery.eq("channel", channel);
  }

  const [leadsRes, conversionsRes, campaignsRes] = await Promise.all([
    leadsQuery,
    conversionsQuery,
    campaignsQuery,
  ]);

  const leads: any[] = leadsRes.data || [];
  const conversions: any[] = conversionsRes.data || [];
  const campaigns: any[] = campaignsRes.data || [];

  // If channel filter, only count leads for those campaign ids
  const channelCampaignIds = channel ? new Set(campaigns.map((c: any) => c.id)) : null;

  const filteredLeads = channelCampaignIds
    ? leads.filter(
        (l: any) =>
          channelCampaignIds.has(l.campaign_id) ||
          channelCampaignIds.has(l.first_touch_campaign_id) ||
          channelCampaignIds.has(l.last_touch_campaign_id),
      )
    : leads;

  const filteredConversions = channelCampaignIds
    ? conversions.filter(
        (c: any) =>
          channelCampaignIds.has(c.first_touch_campaign_id) ||
          channelCampaignIds.has(c.last_touch_campaign_id),
      )
    : conversions;

  // ── 4. Totals ──
  const totalLeads = filteredLeads.length;
  const signups = filteredConversions.filter((c: any) => c.conversion_type === "signup_completed");
  const activations = filteredConversions.filter((c: any) => c.conversion_type === "activation");
  const paids = filteredConversions.filter((c: any) => c.conversion_type === "paid_conversion");

  const totalSignups = signups.length;
  const totalActivations = activations.length;
  const totalPaid = paids.length;

  // ── 5. Conversion rates ──
  const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 10000) / 100 : 0);

  const conversionRates = {
    lead_to_signup_pct: pct(totalSignups, totalLeads),
    signup_to_activation_pct: pct(totalActivations, totalSignups),
    activation_to_paid_pct: pct(totalPaid, totalActivations),
    lead_to_paid_pct: pct(totalPaid, totalLeads),
  };

  // ── 6. Top campaigns by leads ──
  const campaignLeadCounts: Record<string, number> = {};
  for (const lead of filteredLeads) {
    const cid = lead.campaign_id || lead.first_touch_campaign_id || lead.last_touch_campaign_id;
    if (cid) {
      campaignLeadCounts[cid] = (campaignLeadCounts[cid] || 0) + 1;
    }
  }

  const campaignNameMap: Record<string, string> = {};
  for (const c of campaigns) {
    campaignNameMap[c.id] = c.name;
  }

  const topCampaigns = Object.entries(campaignLeadCounts)
    .map(([cid, count]) => ({ campaign_id: cid, name: campaignNameMap[cid] || cid, leads: count }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 10);

  // ── 7. Top sources ──
  const sourceCounts: Record<string, number> = {};
  for (const lead of filteredLeads) {
    const src = lead.utm_source || "direct";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  }
  const topSources = Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, leads: count }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 10);

  // ── 8. Top referrers ──
  const referrerCounts: Record<string, number> = {};
  for (const lead of filteredLeads) {
    if (lead.referrer) {
      referrerCounts[lead.referrer] = (referrerCounts[lead.referrer] || 0) + 1;
    }
  }
  const topReferrers = Object.entries(referrerCounts)
    .map(([referrer, count]) => ({ referrer, leads: count }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 10);

  // ── 9. Top landing pages ──
  const landingPageCounts: Record<string, number> = {};
  for (const lead of filteredLeads) {
    if (lead.landing_page_id) {
      landingPageCounts[lead.landing_page_id] = (landingPageCounts[lead.landing_page_id] || 0) + 1;
    }
  }
  const topLandingPageIds = Object.entries(landingPageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  let landingPageNames: Record<string, string> = {};
  const lpIds = topLandingPageIds.map(([id]) => id);
  if (lpIds.length > 0) {
    const { data: pages } = await (supabase.from("landing_pages") as any)
      .select("id, name")
      .in("id", lpIds);
    if (pages) {
      for (const p of pages) landingPageNames[p.id] = p.name;
    }
  }

  const topLandingPages = topLandingPageIds.map(([id, count]) => ({
    landing_page_id: id,
    name: landingPageNames[id] || id,
    leads: count,
  }));

  // ── 10. Daily breakdown ──
  const dailyMap: Record<string, { leads: number; signups: number; paid: number }> = {};

  for (const lead of filteredLeads) {
    const day = lead.created_at.split("T")[0];
    if (!dailyMap[day]) dailyMap[day] = { leads: 0, signups: 0, paid: 0 };
    dailyMap[day].leads++;
  }

  for (const conv of filteredConversions) {
    const day = conv.created_at.split("T")[0];
    if (!dailyMap[day]) dailyMap[day] = { leads: 0, signups: 0, paid: 0 };
    if (conv.conversion_type === "signup_completed") dailyMap[day].signups++;
    if (conv.conversion_type === "paid_conversion") dailyMap[day].paid++;
  }

  const dailyBreakdown = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, stats]) => ({ date, ...stats }));

  // ── 11. Cost metrics ──
  const totalSpend = campaigns
    .filter((c: any) => {
      if (campaignId) return c.id === campaignId;
      return true;
    })
    .reduce((sum: number, c: any) => sum + (c.budget_spent || 0), 0);

  const costMetrics = {
    total_spend: totalSpend,
    cpl: totalLeads > 0 ? Math.round((totalSpend / totalLeads) * 100) / 100 : 0,
    cpsu: totalSignups > 0 ? Math.round((totalSpend / totalSignups) * 100) / 100 : 0,
    cpp: totalPaid > 0 ? Math.round((totalSpend / totalPaid) * 100) / 100 : 0,
  };

  // ── 12. Attribution comparison ──
  const attributionMap: Record<string, { first_touch_leads: number; last_touch_leads: number }> = {};
  for (const lead of filteredLeads) {
    if (lead.first_touch_campaign_id) {
      if (!attributionMap[lead.first_touch_campaign_id]) {
        attributionMap[lead.first_touch_campaign_id] = { first_touch_leads: 0, last_touch_leads: 0 };
      }
      attributionMap[lead.first_touch_campaign_id].first_touch_leads++;
    }
    if (lead.last_touch_campaign_id) {
      if (!attributionMap[lead.last_touch_campaign_id]) {
        attributionMap[lead.last_touch_campaign_id] = { first_touch_leads: 0, last_touch_leads: 0 };
      }
      attributionMap[lead.last_touch_campaign_id].last_touch_leads++;
    }
  }

  const attributionComparison = Object.entries(attributionMap).map(([cid, counts]) => ({
    campaign_id: cid,
    name: campaignNameMap[cid] || cid,
    ...counts,
  }));

  // Shape response to match frontend GrowthData interface
  return NextResponse.json({
    kpis: {
      total_leads: totalLeads,
      total_signups: totalSignups,
      total_activations: totalActivations,
      total_paid: totalPaid,
      lead_to_signup_pct: conversionRates.lead_to_signup_pct,
      signup_to_paid_pct: conversionRates.activation_to_paid_pct,
      lead_to_paid_pct: conversionRates.lead_to_paid_pct,
      avg_cpl: costMetrics.cpl || null,
    },
    top_campaigns: topCampaigns.map((c) => {
      const camp = campaigns.find((ca: { id: string }) => ca.id === c.campaign_id);
      const campSignups = filteredConversions.filter((cv: any) =>
        cv.conversion_type === "signup_completed" &&
        (cv.first_touch_campaign_id === c.campaign_id || cv.last_touch_campaign_id === c.campaign_id)
      ).length;
      const campPaid = filteredConversions.filter((cv: any) =>
        cv.conversion_type === "paid_conversion" &&
        (cv.first_touch_campaign_id === c.campaign_id || cv.last_touch_campaign_id === c.campaign_id)
      ).length;
      return {
        id: c.campaign_id,
        name: c.name,
        channel: camp?.channel || "other",
        leads: c.leads,
        signups: campSignups,
        paid: campPaid,
        conversion_pct: c.leads > 0 ? Math.round((campPaid / c.leads) * 10000) / 100 : null,
        cpl: c.leads > 0 && (camp?.budget_spent || 0) > 0 ? Math.round(((camp?.budget_spent || 0) / c.leads) * 100) / 100 : null,
      };
    }),
    top_sources: topSources.map((s) => ({ source_name: s.source, leads_count: s.leads })),
    top_referrers: topReferrers.map((r) => ({ referrer: r.referrer, leads_count: r.leads })),
    top_landing_pages: topLandingPages.map((lp) => ({
      landing_page_id: lp.landing_page_id,
      name: lp.name,
      leads_count: lp.leads,
    })),
    daily_breakdown: dailyBreakdown,
    cost_metrics: costMetrics,
    attribution_comparison: attributionComparison,
  });
}

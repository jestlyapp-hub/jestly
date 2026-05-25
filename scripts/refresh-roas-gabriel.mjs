#!/usr/bin/env node
/**
 * Recompute campaign_performance_daily pour Gabriel sur 90j.
 * Reproduit la logique de roas-engine.ts en JS pur (pour pouvoir tourner hors Next).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = {};
for (const l of fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf-8").split(/\r?\n/)) {
  if (!l || l.startsWith("#")) continue;
  const e = l.indexOf("="); if (e < 0) continue;
  let v = l.slice(e + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  env[l.slice(0, e).trim()] = v;
}

const GABRIEL = "ef7a948f-2fab-41da-a5aa-a9f0b558adf0";
const ref = new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const postgres = (await import("postgres")).default;
const sql = postgres({
  host: `db.${ref}.supabase.co`, port: 5432, database: "postgres",
  username: "postgres", password: env.DATABASE_PASSWORD, ssl: "require",
});

const DEFAULTS = {
  profitability: 2.0, warning: 1.5, margin: 50,
  attribution_window_days: 7,
};

function normalizeSource(s) {
  if (!s) return null;
  const v = String(s).toLowerCase().replace(/[_\s.\-/]/g, "");
  if (["pinterest", "pinterestads", "pinterestcom"].includes(v)) return "pinterest";
  if (["google", "googleads", "adwords"].includes(v)) return "google_ads";
  return null;
}
function normalizeCampaignName(s) { return String(s ?? "").toLowerCase().trim().replace(/\s+/g, " "); }

try {
  console.log("══════════════════════════════════════════════════════════════");
  console.log("REFRESH ROAS — Gabriel · 90j");
  console.log("══════════════════════════════════════════════════════════════\n");

  // Settings (defaults)
  const [settings] = await sql`SELECT * FROM public.ecom_settings WHERE user_id = ${GABRIEL}::uuid`;
  const s = settings ?? DEFAULTS;
  const profitability = Number(s.roas_profitability_threshold ?? DEFAULTS.profitability);
  const warning = Number(s.roas_warning_threshold ?? DEFAULTS.warning);
  const attrWindow = Number(s.attribution_window_days ?? DEFAULTS.attribution_window_days);

  // Charge campagnes Pinterest
  const [pinterestInteg] = await sql`SELECT id FROM public.integrations WHERE user_id = ${GABRIEL}::uuid AND provider = 'pinterest' AND status = 'active'`;
  if (!pinterestInteg) { console.error("Pas d'intégration Pinterest"); process.exit(1); }
  const campaigns = await sql`SELECT pinterest_campaign_id, name, status FROM public.pinterest_campaigns WHERE integration_id = ${pinterestInteg.id}`;
  const campStatusMap = new Map(campaigns.map((c) => [c.pinterest_campaign_id, c.status ?? null]));
  console.log(`Campagnes Pinterest : ${campaigns.length}`);

  // Charge orders Shopify (window 90j + 7j buffer)
  const [shopifyInteg] = await sql`SELECT id FROM public.integrations WHERE user_id = ${GABRIEL}::uuid AND provider = 'shopify' AND status = 'active'`;
  const ordersFromIso = new Date(Date.now() - (90 + attrWindow) * 86400000).toISOString().slice(0, 10);
  const toIso = new Date().toISOString().slice(0, 10);
  const fromIso = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
  const orders = await sql`
    SELECT shopify_order_id, created_at::text, total_price, landing_site, referring_site,
           utm_source, utm_medium, utm_campaign
    FROM public.shopify_orders
    WHERE integration_id = ${shopifyInteg.id}
      AND created_at >= ${ordersFromIso + "T00:00:00"}
      AND created_at <= ${toIso + "T23:59:59"}
      AND cancelled_at IS NULL
  `;
  console.log(`Orders Shopify dans la fenêtre : ${orders.length}\n`);

  // Match chaque order
  const orderMatches = [];
  for (const o of orders) {
    let match = { method: "unmatched", campaign_id: null, campaign_name: null, weight: 1, confidence: 0 };
    if (o.utm_campaign) {
      const utmc = String(o.utm_campaign).trim();
      const norm = normalizeCampaignName(utmc);
      const idMatches = campaigns.filter((c) => c.pinterest_campaign_id === utmc);
      const nameMatches = campaigns.filter((c) => normalizeCampaignName(c.name) === norm);
      const winners = idMatches.length > 0 ? idMatches : nameMatches;
      if (winners.length === 1) {
        match = {
          method: "utm_campaign_exact",
          campaign_id: winners[0].pinterest_campaign_id,
          campaign_name: winners[0].name,
          weight: 1.0,
          confidence: idMatches.length > 0 ? 0.98 : 0.95,
        };
      }
    }
    // Si toujours unmatched et source Pinterest, prorata sur spend
    if (match.method === "unmatched") {
      const src = normalizeSource(o.utm_source ?? o.referring_site);
      if (src === "pinterest") {
        const orderDate = new Date(o.created_at);
        const winFrom = new Date(orderDate.getTime() - attrWindow * 86400000).toISOString().slice(0, 10);
        const winTo = orderDate.toISOString().slice(0, 10);
        const spendRows = await sql`
          SELECT entity_id, SUM(spend_cents)::bigint AS s
          FROM public.pinterest_metrics_daily
          WHERE integration_id = ${pinterestInteg.id} AND entity_type='campaign'
            AND date >= ${winFrom} AND date <= ${winTo}
          GROUP BY entity_id ORDER BY s DESC LIMIT 3
        `;
        const total = spendRows.reduce((a, r) => a + Number(r.s), 0);
        if (total > 0 && spendRows[0]) {
          const camp = campaigns.find((c) => c.pinterest_campaign_id === spendRows[0].entity_id);
          if (camp) {
            match = {
              method: "utm_source_prorata", campaign_id: camp.pinterest_campaign_id,
              campaign_name: camp.name, weight: Number(spendRows[0].s) / total, confidence: 0.7,
            };
          }
        }
      }
    }
    orderMatches.push({ order: o, match });
  }

  // Persist attribution_touches (truncate + insert)
  const orderIds = orderMatches.filter((m) => m.order.created_at >= fromIso).map((m) => m.order.shopify_order_id);
  if (orderIds.length > 0) {
    await sql`DELETE FROM public.order_attribution_touches WHERE user_id=${GABRIEL}::uuid AND order_id = ANY(${orderIds})`;
  }
  for (const { order, match } of orderMatches) {
    if (order.created_at < fromIso) continue;
    await sql`
      INSERT INTO public.order_attribution_touches
        (user_id, order_id, touch_index, touch_at, provider, campaign_id, campaign_name,
         utm_source, utm_medium, utm_campaign, referring_site, landing_path,
         attribution_weight, attribution_method)
      VALUES (${GABRIEL}::uuid, ${order.shopify_order_id}, 0, ${order.created_at},
              ${match.campaign_id ? "pinterest" : null}, ${match.campaign_id}, ${match.campaign_name},
              ${order.utm_source}, ${order.utm_medium}, ${order.utm_campaign},
              ${order.referring_site}, ${order.landing_site}, ${match.weight}, ${match.method})
    `;
  }
  console.log(`✓ Attribution touches persistées (${orderMatches.length} orders)`);

  // Charge metrics daily
  const metrics = await sql`
    SELECT date::text, entity_id, spend_cents, impressions, clicks, outbound_clicks,
           conversions, conversion_value_cents, pinterest_reported_roas
    FROM public.pinterest_metrics_daily
    WHERE integration_id = ${pinterestInteg.id} AND entity_type = 'campaign'
      AND date >= ${fromIso} AND date <= ${toIso}
  `;
  console.log(`Metrics daily : ${metrics.length}`);

  // Purge la fenêtre avant ré-insertion (cohérence : retire les jours qui ne sont
  // plus renvoyés par l'API Ads). Cf bug agrégation Ads 2026-05-25.
  await sql`DELETE FROM public.campaign_performance_daily
            WHERE user_id = ${GABRIEL}::uuid AND provider = 'pinterest'
              AND date >= ${fromIso} AND date <= ${toIso}`;

  // Agrège orders attribués par (campaign, jour)
  const attrByKey = new Map();
  for (const { order, match } of orderMatches) {
    if (!match.campaign_id) continue;
    const day = order.created_at.slice(0, 10);
    const key = `${match.campaign_id}|${day}`;
    const cur = attrByKey.get(key) ?? { orders: new Set(), revenue_cents: 0, methods: new Set(), confidences: [] };
    cur.orders.add(order.shopify_order_id);
    cur.revenue_cents += Math.round(Number(order.total_price) * 100 * match.weight);
    cur.methods.add(match.method);
    cur.confidences.push(match.confidence);
    attrByKey.set(key, cur);
  }

  // Upsert campaign_performance_daily
  const campNameMap = new Map(campaigns.map((c) => [c.pinterest_campaign_id, c.name]));
  let upserted = 0;
  for (const m of metrics) {
    const key = `${m.entity_id}|${m.date}`;
    const attr = attrByKey.get(key);
    const revenue = attr?.revenue_cents ?? 0;
    const orderCount = attr?.orders.size ?? 0;
    const orderIds = attr ? [...attr.orders] : [];
    const spend = Number(m.spend_cents);
    const realRoas = spend > 0 ? Math.round((revenue / spend) * 10000) / 10000 : null;
    const marginalRoas = spend > 0 ? Math.round(((revenue * Number(s.net_margin_percent ?? 50) / 100) / spend) * 10000) / 10000 : null;
    const adsRoas = m.pinterest_reported_roas != null ? Number(m.pinterest_reported_roas) : null;
    const roasDelta = realRoas != null && adsRoas != null ? realRoas - adsRoas : null;
    let status;
    if (spend === 0) status = revenue > 0 ? "profitable" : "unmatched";
    else if (realRoas == null) status = "unmatched";
    else if (realRoas >= profitability) status = "profitable";
    else if (realRoas >= warning) status = "warning";
    else status = "unprofitable";
    const method = attr ? [...attr.methods].sort()[0] : null;
    const confidence = attr?.confidences.length > 0 ? attr.confidences.reduce((s, c) => s + c, 0) / attr.confidences.length : null;

    await sql`
      INSERT INTO public.campaign_performance_daily (
        user_id, date, provider, campaign_id, campaign_name, campaign_status,
        ads_spend_cents, ads_impressions, ads_clicks, ads_outbound_clicks,
        ads_conversions, ads_conversions_value_cents, ads_reported_roas,
        shopify_orders_count, shopify_revenue_cents, shopify_attributable_order_ids,
        real_roas, roas_delta, marginal_roas, is_profitable, profit_status,
        attribution_method, attribution_confidence, computed_at
      ) VALUES (
        ${GABRIEL}::uuid, ${m.date}, 'pinterest', ${m.entity_id}, ${campNameMap.get(m.entity_id) ?? m.entity_id},
        ${campStatusMap.get(m.entity_id) ?? null},
        ${spend}, ${m.impressions}, ${m.clicks}, ${m.outbound_clicks},
        ${m.conversions}, ${m.conversion_value_cents}, ${adsRoas},
        ${orderCount}, ${revenue}, ${orderIds},
        ${realRoas}, ${roasDelta}, ${marginalRoas}, ${status === "profitable"}, ${status},
        ${method}, ${confidence}, now()
      )
      ON CONFLICT (user_id, date, provider, campaign_id) DO UPDATE SET
        campaign_name = EXCLUDED.campaign_name,
        campaign_status = EXCLUDED.campaign_status,
        ads_spend_cents = EXCLUDED.ads_spend_cents,
        ads_impressions = EXCLUDED.ads_impressions,
        ads_clicks = EXCLUDED.ads_clicks,
        ads_outbound_clicks = EXCLUDED.ads_outbound_clicks,
        ads_conversions = EXCLUDED.ads_conversions,
        ads_conversions_value_cents = EXCLUDED.ads_conversions_value_cents,
        ads_reported_roas = EXCLUDED.ads_reported_roas,
        shopify_orders_count = EXCLUDED.shopify_orders_count,
        shopify_revenue_cents = EXCLUDED.shopify_revenue_cents,
        shopify_attributable_order_ids = EXCLUDED.shopify_attributable_order_ids,
        real_roas = EXCLUDED.real_roas,
        roas_delta = EXCLUDED.roas_delta,
        marginal_roas = EXCLUDED.marginal_roas,
        is_profitable = EXCLUDED.is_profitable,
        profit_status = EXCLUDED.profit_status,
        attribution_method = EXCLUDED.attribution_method,
        attribution_confidence = EXCLUDED.attribution_confidence,
        computed_at = now()
    `;
    upserted++;
  }

  console.log(`✓ campaign_performance_daily : ${upserted} rows upserted\n`);

  // Stats finales
  const stats = await sql`
    SELECT profit_status, COUNT(*)::int as c, SUM(ads_spend_cents)::bigint as spend, SUM(shopify_revenue_cents)::bigint as rev
    FROM public.campaign_performance_daily WHERE user_id = ${GABRIEL}::uuid
    GROUP BY profit_status ORDER BY profit_status
  `;
  console.log("── Stats par statut ──");
  for (const r of stats) {
    console.log(`  ${r.profit_status.padEnd(14)} ${String(r.c).padStart(3)} rows · spend ${(Number(r.spend) / 100).toFixed(2)}€ · revenue ${(Number(r.rev) / 100).toFixed(2)}€`);
  }

  const byCampaign = await sql`
    SELECT campaign_name, SUM(ads_spend_cents)::bigint as spend, SUM(shopify_revenue_cents)::bigint as rev, SUM(shopify_orders_count)::int as orders
    FROM public.campaign_performance_daily WHERE user_id = ${GABRIEL}::uuid
    GROUP BY campaign_name ORDER BY spend DESC
  `;
  console.log("\n── Top campagnes (90j) ──");
  for (const c of byCampaign) {
    const spend = Number(c.spend), rev = Number(c.rev);
    const roas = spend > 0 ? (rev / spend).toFixed(2) : "—";
    console.log(`  ${c.campaign_name.padEnd(50)} ${(spend / 100).toFixed(2).padStart(8)}€  rev ${(rev / 100).toFixed(2).padStart(8)}€  ROAS ${roas}×  orders ${c.orders}`);
  }
} finally {
  await sql.end();
}

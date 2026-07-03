#!/usr/bin/env node
/**
 * Backfill du flag de traçabilité (migration 094) sur l'historique des commandes.
 *
 * Pour chaque intégration Shopify active :
 *  1. décrypte le client_secret (AES-256-GCM, ENCRYPTION_KEY de .env.local)
 *  2. mint un token client_credentials
 *  3. re-parcourt TOUTES les commandes avec customerJourneySummary
 *     { ready, momentsCount { count }, firstVisit }
 *  4. met à jour journey_moments_count + colonnes d'attribution (COALESCE :
 *     ne jamais écraser une valeur existante par du null)
 *  5. recalcule tracking_status en SQL — même logique que
 *     src/lib/shopify/tracking-status.ts (tracked / ghost / unmatched, null = inconnu)
 *
 * Usage : node scripts/resync-orders-tracking.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createDecipheriv } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const eq = line.indexOf("="); if (eq < 0) continue;
  const k = line.slice(0, eq).trim();
  let v = line.slice(eq + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  if (!process.env[k]) process.env[k] = v;
}

// ── Décryptage (même format que src/lib/encryption.ts) ──────────
function decryptFromString(encoded) {
  const key = Buffer.from(process.env.ENCRYPTION_KEY, "base64");
  if (key.length !== 32) throw new Error("ENCRYPTION_KEY doit faire 32 bytes en base64");
  const buf = Buffer.from(encoded, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

// ── Shopify ──────────────────────────────────────────────────────
async function mintToken(shopDomain, clientId, clientSecret) {
  const r = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }),
  });
  if (!r.ok) throw new Error(`Token mint échoué : ${r.status} ${await r.text()}`);
  return (await r.json()).access_token;
}

async function gql(shopDomain, apiVersion, token, query, vars) {
  const r = await fetch(`https://${shopDomain}/admin/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables: vars }),
  });
  const j = await r.json();
  if (j.errors) throw new Error("GraphQL : " + JSON.stringify(j.errors));
  return j.data;
}

// momentsCount est un objet Count sur les versions récentes de l'Admin API ;
// fallback scalaire Int pour les versions plus anciennes.
const QUERY_COUNT_OBJ = `query Orders($first:Int!,$after:String){orders(first:$first,after:$after,sortKey:CREATED_AT,reverse:true){pageInfo{hasNextPage endCursor} edges{node{id customerJourneySummary{ready momentsCount{count} firstVisit{landingPage referrerUrl utmParameters{source medium campaign}}}}}}}`;
const QUERY_COUNT_INT = `query Orders($first:Int!,$after:String){orders(first:$first,after:$after,sortKey:CREATED_AT,reverse:true){pageInfo{hasNextPage endCursor} edges{node{id customerJourneySummary{ready momentsCount firstVisit{landingPage referrerUrl utmParameters{source medium campaign}}}}}}}`;

const gidId = (g) => (g ? g.split("/").pop() : null);

// ── Main ─────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ref = new URL(supabaseUrl).hostname.split(".")[0];
const postgres = (await import("postgres")).default;
const sql = postgres({
  host: `db.${ref}.supabase.co`, port: 5432, database: "postgres", username: "postgres",
  password: process.env.DATABASE_PASSWORD, ssl: "require", max: 1,
});

try {
  const integrations = await sql`
    SELECT id, shop_domain, secret_encrypted, metadata
    FROM public.integrations
    WHERE provider = 'shopify' AND status = 'active'
  `;
  if (integrations.length === 0) { console.error("✗ Aucune intégration Shopify active"); process.exit(1); }

  for (const integ of integrations) {
    const clientId = integ.metadata?.client_id;
    const apiVersion = integ.metadata?.api_version ?? "2025-01";
    console.log(`\n→ ${integ.shop_domain} (API ${apiVersion})`);

    const secret = decryptFromString(integ.secret_encrypted);
    const token = await mintToken(integ.shop_domain, clientId, secret);

    // Détection de la forme de momentsCount (Count vs Int)
    let query = QUERY_COUNT_OBJ;
    let readCount = (mc) => (mc == null ? null : mc.count ?? null);
    try {
      await gql(integ.shop_domain, apiVersion, token, QUERY_COUNT_OBJ, { first: 1, after: null });
    } catch {
      console.log("  momentsCount { count } refusé — fallback momentsCount scalaire");
      query = QUERY_COUNT_INT;
      readCount = (mc) => (typeof mc === "number" ? mc : null);
    }

    let cursor = null;
    let updated = 0;
    do {
      const data = await gql(integ.shop_domain, apiVersion, token, query, { first: 100, after: cursor });
      for (const { node } of data.orders.edges) {
        const journey = node.customerJourneySummary;
        const momentsCount = journey?.ready === false ? null : readCount(journey?.momentsCount);
        const fv = journey?.firstVisit;
        const utm = fv?.utmParameters;
        await sql`
          UPDATE public.shopify_orders SET
            journey_moments_count = ${momentsCount},
            referring_site = COALESCE(${fv?.referrerUrl ?? null}, referring_site),
            landing_site = COALESCE(${fv?.landingPage ?? null}, landing_site),
            utm_source = COALESCE(${utm?.source ?? null}, utm_source),
            utm_medium = COALESCE(${utm?.medium ?? null}, utm_medium),
            utm_campaign = COALESCE(${utm?.campaign ?? null}, utm_campaign)
          WHERE integration_id = ${integ.id} AND shopify_order_id = ${gidId(node.id)}
        `;
        updated++;
      }
      cursor = data.orders.pageInfo.hasNextPage ? data.orders.pageInfo.endCursor : null;
    } while (cursor);
    console.log(`  ✓ ${updated} commandes re-parcourues`);

    // Recalcul du flag — MÊME logique que computeTrackingStatus() :
    // ghost prime sur les signaux ; gclid/gbraid/wbraid/utm dans la landing comptent.
    await sql`
      UPDATE public.shopify_orders SET tracking_status = CASE
        WHEN journey_moments_count IS NULL THEN NULL
        WHEN journey_moments_count = 0 THEN 'ghost'
        WHEN NULLIF(utm_source, '') IS NOT NULL
          OR NULLIF(utm_medium, '') IS NOT NULL
          OR NULLIF(utm_campaign, '') IS NOT NULL
          OR NULLIF(referring_site, '') IS NOT NULL
          OR landing_site ~* '[?&](gclid|gbraid|wbraid|utm_[a-z]+)=' THEN 'tracked'
        ELSE 'unmatched'
      END
      WHERE integration_id = ${integ.id}
    `;

    const recap = await sql`
      SELECT COALESCE(tracking_status, 'inconnu') AS statut, count(*)::int AS n
      FROM public.shopify_orders
      WHERE integration_id = ${integ.id}
      GROUP BY 1 ORDER BY 2 DESC
    `;
    console.log("  Répartition traçabilité :");
    for (const r of recap) console.log(`    ${r.statut.padEnd(10)} ${r.n}`);
  }

  console.log("\n✅ Backfill traçabilité terminé");
} finally {
  await sql.end();
}

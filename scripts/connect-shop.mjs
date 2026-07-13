#!/usr/bin/env node
/**
 * Connecte une boutique Shopify (client_credentials) pour un user Jestly :
 * valide les creds (mint token + query shop), chiffre le secret (miroir de
 * lib/encryption.ts), upsert la ligne `integrations`, puis fait l'initial sync
 * (orders / products / customers) et marque sync_state complété.
 *
 * Reproduit EXACTEMENT la route /api/integrations/shopify/connect + initialFullSync,
 * mais en script (multi-tenant : le user est explicite). Idempotent.
 *
 * Usage :
 *   node scripts/connect-shop.mjs --user <uuid> --domain <x.myshopify.com> \
 *        --client-id <id> --secret <shpss_...> [--label "Nom"] [--api 2025-01]
 *
 * Requiert dans .env.local : NEXT_PUBLIC_SUPABASE_URL, DATABASE_PASSWORD,
 *   ENCRYPTION_KEY (base64 32B) ou ENCRYPTION_MASTER_KEY.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
for (const line of fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf-8").split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const eq = line.indexOf("="); if (eq < 0) continue;
  const k = line.slice(0, eq).trim();
  let v = line.slice(eq + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  if (!process.env[k]) process.env[k] = v;
}

// ── Args ─────────────────────────────────────────────────────────
function arg(name) { const i = process.argv.indexOf(`--${name}`); return i >= 0 ? process.argv[i + 1] : null; }
const USER_ID = arg("user");
const SHOP = (arg("domain") ?? "").toLowerCase();
const CLIENT_ID = arg("client-id");
const CLIENT_SECRET = arg("secret");
const LABEL = arg("label") ?? null;
const API_VERSION = arg("api") ?? "2025-01";
if (!USER_ID || !SHOP || !CLIENT_ID || !CLIENT_SECRET) {
  console.error("Usage : node scripts/connect-shop.mjs --user <uuid> --domain <x.myshopify.com> --client-id <id> --secret <shpss_...> [--label \"Nom\"]");
  process.exit(1);
}
if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(SHOP)) {
  console.error(`✗ domaine invalide : ${SHOP} (attendu <x>.myshopify.com)`);
  process.exit(1);
}

const SCOPES = [
  "read_orders", "read_all_orders", "read_products", "read_product_listings",
  "read_customers", "read_inventory", "read_locations", "read_analytics",
  "read_reports", "read_fulfillments", "read_shipping", "read_marketing_events",
  "read_publications", "read_price_rules", "read_discounts", "read_checkouts",
];

// ── Chiffrement (miroir lib/encryption.ts) ───────────────────────
function getKey() {
  if (process.env.ENCRYPTION_KEY) {
    const k = Buffer.from(process.env.ENCRYPTION_KEY, "base64");
    if (k.length !== 32) throw new Error(`ENCRYPTION_KEY doit faire 32 bytes base64 (got ${k.length})`);
    return k;
  }
  if (process.env.ENCRYPTION_MASTER_KEY) return scryptSync(process.env.ENCRYPTION_MASTER_KEY, "jestly-integrations-salt-v1", 32);
  throw new Error("ENCRYPTION_KEY ou ENCRYPTION_MASTER_KEY manquant");
}
function encryptToString(pt) {
  const key = getKey(); const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([c.update(pt, "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), ct]).toString("base64");
}
function decryptFromString(enc) {
  const key = getKey(); const b = Buffer.from(enc, "base64");
  const d = createDecipheriv("aes-256-gcm", key, b.subarray(0, 12));
  d.setAuthTag(b.subarray(12, 28));
  return Buffer.concat([d.update(b.subarray(28)), d.final()]).toString("utf8");
}

// ── Shopify ──────────────────────────────────────────────────────
async function mint() {
  const r = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(`Mint token ${r.status} — ${t.slice(0, 160)} (domaine ou creds erronés ?)`); }
  return (await r.json()).access_token;
}
async function gql(token, query, vars) {
  const r = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables: vars }),
  });
  const j = await r.json();
  if (j.errors) throw new Error("GraphQL: " + JSON.stringify(j.errors).slice(0, 200));
  return j.data;
}
const gidId = (g) => (g ? g.split("/").pop() : null);
const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };

const QSHOP = `{ shop { name currencyCode ianaTimezone } }`;
const QO = `query O($first:Int!,$after:String){orders(first:$first,after:$after,sortKey:CREATED_AT,reverse:true){pageInfo{hasNextPage endCursor} edges{node{id name createdAt updatedAt processedAt cancelledAt displayFinancialStatus displayFulfillmentStatus email phone tags sourceName customAttributes{key value} customerJourneySummary{firstVisit{landingPage referrerUrl source utmParameters{source medium campaign}}} totalPriceSet{shopMoney{amount currencyCode}} subtotalPriceSet{shopMoney{amount currencyCode}} totalTaxSet{shopMoney{amount}} totalShippingPriceSet{shopMoney{amount}} totalDiscountsSet{shopMoney{amount}} currencyCode customer{id email firstName lastName} shippingAddress{firstName lastName address1 address2 city province country countryCodeV2 zip phone} lineItems(first:50){edges{node{id title variantTitle quantity sku vendor product{id} variant{id image{url}} originalUnitPriceSet{shopMoney{amount}} totalDiscountSet{shopMoney{amount}}}}}}}}}`;
const QP = `query P($first:Int!,$after:String){products(first:$first,after:$after,sortKey:UPDATED_AT,reverse:true){pageInfo{hasNextPage endCursor} edges{node{id title handle description productType vendor status tags createdAt updatedAt publishedAt totalInventory priceRangeV2{minVariantPrice{amount} maxVariantPrice{amount}} featuredImage{url altText} images(first:10){edges{node{url altText}}} variants(first:50){edges{node{id title sku price compareAtPrice inventoryQuantity position}}}}}}}`;
const QC = `query C($first:Int!,$after:String){customers(first:$first,after:$after,sortKey:UPDATED_AT,reverse:true){pageInfo{hasNextPage endCursor} edges{node{id email firstName lastName phone numberOfOrders amountSpent{amount currencyCode} tags emailMarketingConsent{marketingState} createdAt updatedAt defaultAddress{firstName lastName address1 city country zip} addresses{firstName lastName address1 city country zip}}}}}`;

// ── DB ───────────────────────────────────────────────────────────
const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const postgres = (await import("postgres")).default;
const sql = postgres({ host: `db.${ref}.supabase.co`, port: 5432, database: "postgres", username: "postgres", password: process.env.DATABASE_PASSWORD, ssl: "require" });

try {
  console.log(`\n=== Connexion Shopify : ${SHOP} → user ${USER_ID} ===\n`);

  // 1. Valider les creds + round-trip chiffrement
  const enc = encryptToString(CLIENT_SECRET);
  if (decryptFromString(enc) !== CLIENT_SECRET) throw new Error("Round-trip chiffrement échoué");
  console.log("✓ Round-trip chiffrement OK");

  const token = await mint();
  const shopInfo = (await gql(token, QSHOP)).shop;
  const shopName = LABEL ?? shopInfo?.name ?? SHOP;
  console.log(`✓ Boutique validée : « ${shopInfo?.name} » (${shopInfo?.currencyCode}, ${shopInfo?.ianaTimezone})`);

  // 2. Upsert integration
  const metadata = { auth: "client_credentials", client_id: CLIENT_ID, api_version: API_VERSION, shop_name: shopName, currency: shopInfo?.currencyCode ?? null, timezone: shopInfo?.ianaTimezone ?? null };
  const [row] = await sql`
    INSERT INTO public.integrations (user_id, provider, shop_domain, secret_encrypted, scopes, metadata, status, last_error)
    VALUES (${USER_ID}::uuid, 'shopify', ${SHOP}, ${enc}, ${SCOPES}, ${sql.json(metadata)}, 'active', null)
    ON CONFLICT (user_id, provider, shop_domain) DO UPDATE SET
      secret_encrypted = EXCLUDED.secret_encrypted, scopes = EXCLUDED.scopes,
      metadata = EXCLUDED.metadata, status = 'active', last_error = null
    RETURNING id
  `;
  const INTEG_ID = row.id;
  console.log(`✓ Integration : ${INTEG_ID}`);
  const check = await sql`SELECT secret_encrypted FROM public.integrations WHERE id = ${INTEG_ID}`;
  if (decryptFromString(check[0].secret_encrypted) !== CLIENT_SECRET) throw new Error("Vérif déchiffrement DB échouée");
  console.log("✓ Vérif déchiffrement DB OK");

  // 3. Initial sync — orders
  console.log("→ Sync commandes…");
  let cursor = null, totalOrders = 0;
  do {
    const data = await gql(token, QO, { first: 50, after: cursor });
    for (const { node } of data.orders.edges) {
      const fv = node.customerJourneySummary?.firstVisit; const utm = fv?.utmParameters;
      const li = node.lineItems.edges.map(({ node: l }) => ({ id: gidId(l.id), product_id: gidId(l.product?.id), variant_id: gidId(l.variant?.id), title: l.title, variant_title: l.variantTitle, quantity: l.quantity, price: num(l.originalUnitPriceSet?.shopMoney?.amount) ?? 0, total_discount: num(l.totalDiscountSet?.shopMoney?.amount) ?? 0, sku: l.sku, vendor: l.vendor, image_url: l.variant?.image?.url ?? null }));
      const r = {
        integration_id: INTEG_ID, shopify_order_id: gidId(node.id), order_number: node.name?.replace(/^#/, ""), name: node.name,
        total_price: num(node.totalPriceSet?.shopMoney?.amount), subtotal_price: num(node.subtotalPriceSet?.shopMoney?.amount),
        total_tax: num(node.totalTaxSet?.shopMoney?.amount), total_shipping: num(node.totalShippingPriceSet?.shopMoney?.amount),
        total_discounts: num(node.totalDiscountsSet?.shopMoney?.amount), currency: node.currencyCode,
        financial_status: node.displayFinancialStatus?.toLowerCase() ?? null, fulfillment_status: node.displayFulfillmentStatus?.toLowerCase() ?? null,
        customer_id: gidId(node.customer?.id), email: node.email ?? node.customer?.email ?? null, phone: node.phone,
        line_items: JSON.stringify(li), shipping_address: node.shippingAddress ? JSON.stringify(node.shippingAddress) : null, billing_address: null,
        note_attributes: JSON.stringify(node.customAttributes ?? []), tags: node.tags ?? [], source_name: node.sourceName,
        referring_site: fv?.referrerUrl ?? null, landing_site: fv?.landingPage ?? null,
        utm_source: utm?.source ?? null, utm_medium: utm?.medium ?? null, utm_campaign: utm?.campaign ?? null,
        created_at: node.createdAt, updated_at: node.updatedAt, processed_at: node.processedAt, cancelled_at: node.cancelledAt,
      };
      await sql`INSERT INTO public.shopify_orders ${sql(r)} ON CONFLICT (integration_id, shopify_order_id) DO UPDATE SET updated_at=EXCLUDED.updated_at, financial_status=EXCLUDED.financial_status, fulfillment_status=EXCLUDED.fulfillment_status, total_price=EXCLUDED.total_price, line_items=EXCLUDED.line_items, note_attributes=EXCLUDED.note_attributes`;
      totalOrders++;
    }
    cursor = data.orders.pageInfo.hasNextPage ? data.orders.pageInfo.endCursor : null;
  } while (cursor);
  console.log(`  ✓ ${totalOrders} commandes`);

  // 4. Products
  console.log("→ Sync produits…");
  cursor = null; let totalProducts = 0;
  do {
    const data = await gql(token, QP, { first: 50, after: cursor });
    for (const { node } of data.products.edges) {
      const r = {
        integration_id: INTEG_ID, shopify_product_id: gidId(node.id), title: node.title, handle: node.handle, description: node.description,
        product_type: node.productType, vendor: node.vendor, status: node.status, tags: node.tags ?? [],
        variants: JSON.stringify(node.variants.edges.map(({ node: v }) => ({ id: gidId(v.id), title: v.title, sku: v.sku, price: num(v.price) ?? 0, compare_at_price: num(v.compareAtPrice), inventory_quantity: v.inventoryQuantity ?? 0, inventory_management: null, position: v.position }))),
        images: JSON.stringify(node.images.edges.map(({ node: i }) => ({ url: i.url, alt: i.altText }))),
        featured_image_url: node.featuredImage?.url ?? null, price_min: num(node.priceRangeV2?.minVariantPrice?.amount), price_max: num(node.priceRangeV2?.maxVariantPrice?.amount),
        total_inventory: node.totalInventory, created_at: node.createdAt, updated_at: node.updatedAt, published_at: node.publishedAt,
      };
      await sql`INSERT INTO public.shopify_products ${sql(r)} ON CONFLICT (integration_id, shopify_product_id) DO UPDATE SET title=EXCLUDED.title, status=EXCLUDED.status, total_inventory=EXCLUDED.total_inventory, variants=EXCLUDED.variants, images=EXCLUDED.images, updated_at=EXCLUDED.updated_at`;
      totalProducts++;
    }
    cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
  } while (cursor);
  console.log(`  ✓ ${totalProducts} produits`);

  // 5. Customers
  console.log("→ Sync clients…");
  cursor = null; let totalCustomers = 0;
  do {
    const data = await gql(token, QC, { first: 50, after: cursor });
    for (const { node } of data.customers.edges) {
      const r = {
        integration_id: INTEG_ID, shopify_customer_id: gidId(node.id), email: node.email, first_name: node.firstName, last_name: node.lastName, phone: node.phone,
        orders_count: parseInt(node.numberOfOrders ?? "0", 10), total_spent: num(node.amountSpent?.amount) ?? 0, currency: node.amountSpent?.currencyCode ?? "EUR",
        accepts_marketing: node.emailMarketingConsent?.marketingState === "SUBSCRIBED",
        addresses: JSON.stringify(node.addresses ?? []), default_address: node.defaultAddress ? JSON.stringify(node.defaultAddress) : null,
        tags: node.tags ?? [], created_at: node.createdAt, updated_at: node.updatedAt,
      };
      await sql`INSERT INTO public.shopify_customers ${sql(r)} ON CONFLICT (integration_id, shopify_customer_id) DO UPDATE SET email=EXCLUDED.email, orders_count=EXCLUDED.orders_count, total_spent=EXCLUDED.total_spent, updated_at=EXCLUDED.updated_at`;
      totalCustomers++;
    }
    cursor = data.customers.pageInfo.hasNextPage ? data.customers.pageInfo.endCursor : null;
  } while (cursor);
  console.log(`  ✓ ${totalCustomers} clients`);

  // 6. Sync state + last_sync_at
  const now = new Date().toISOString();
  await sql`
    INSERT INTO public.shopify_sync_state (integration_id, initial_sync_completed, initial_sync_started_at, initial_sync_completed_at, last_orders_sync_at, last_products_sync_at, last_customers_sync_at)
    VALUES (${INTEG_ID}, true, ${now}, ${now}, ${now}, ${now}, ${now})
    ON CONFLICT (integration_id) DO UPDATE SET initial_sync_completed=true, initial_sync_completed_at=${now}, last_orders_sync_at=${now}, last_products_sync_at=${now}, last_customers_sync_at=${now}
  `;
  await sql`UPDATE public.integrations SET last_sync_at = ${now} WHERE id = ${INTEG_ID}`;

  console.log(`\n✅ Boutique connectée & synchronisée : ${totalOrders} commandes / ${totalProducts} produits / ${totalCustomers} clients`);
  console.log(`   integration_id = ${INTEG_ID}`);
} finally {
  await sql.end();
}

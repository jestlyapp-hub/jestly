#!/usr/bin/env node
/**
 * Lance l'initial sync (90j d'historique) pour l'intégration Lhorlogemurale.
 * Utilise les credentials de .env.local et écrit dans le cache Supabase.
 *
 * Usage : node scripts/initial-sync-lhorloge.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const SHOP = process.env.SHOPIFY_LHORLOGEMURALE_SHOP_DOMAIN;
const CLIENT_ID = process.env.SHOPIFY_LHORLOGEMURALE_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_LHORLOGEMURALE_CLIENT_SECRET;
const API_VERSION = process.env.SHOPIFY_LHORLOGEMURALE_API_VERSION ?? "2025-01";
const GABRIEL = "ef7a948f-2fab-41da-a5aa-a9f0b558adf0";

async function mint() {
  const r = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });
  if (!r.ok) throw new Error("Token mint: " + r.status);
  return (await r.json()).access_token;
}

async function gql(token, query, vars) {
  const r = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables: vars }),
  });
  const j = await r.json();
  if (j.errors) throw new Error("GraphQL: " + JSON.stringify(j.errors));
  return j.data;
}

const QO = `query Orders($first:Int!,$after:String){orders(first:$first,after:$after,sortKey:CREATED_AT,reverse:true){pageInfo{hasNextPage endCursor} edges{node{id name createdAt updatedAt processedAt cancelledAt displayFinancialStatus displayFulfillmentStatus email phone tags sourceName customerJourneySummary{firstVisit{landingPage referrerUrl source utmParameters{source medium campaign}}} totalPriceSet{shopMoney{amount currencyCode}} subtotalPriceSet{shopMoney{amount currencyCode}} totalTaxSet{shopMoney{amount}} totalShippingPriceSet{shopMoney{amount}} totalDiscountsSet{shopMoney{amount}} currencyCode customer{id email firstName lastName} shippingAddress{firstName lastName address1 address2 city province country countryCodeV2 zip phone} lineItems(first:50){edges{node{id title variantTitle quantity sku vendor product{id} variant{id image{url}} originalUnitPriceSet{shopMoney{amount}} totalDiscountSet{shopMoney{amount}}}}}}}}}`;

const QP = `query Products($first:Int!,$after:String){products(first:$first,after:$after,sortKey:UPDATED_AT,reverse:true){pageInfo{hasNextPage endCursor} edges{node{id title handle description productType vendor status tags createdAt updatedAt publishedAt totalInventory priceRangeV2{minVariantPrice{amount} maxVariantPrice{amount}} featuredImage{url altText} images(first:10){edges{node{url altText}}} variants(first:50){edges{node{id title sku price compareAtPrice inventoryQuantity position}}}}}}}`;

const QC = `query Customers($first:Int!,$after:String){customers(first:$first,after:$after,sortKey:UPDATED_AT,reverse:true){pageInfo{hasNextPage endCursor} edges{node{id email firstName lastName phone numberOfOrders amountSpent{amount currencyCode} tags emailMarketingConsent{marketingState} createdAt updatedAt defaultAddress{firstName lastName address1 city country zip} addresses{firstName lastName address1 city country zip}}}}}`;

function gidId(g) { return g ? g.split("/").pop() : null; }
function num(v) { const n = parseFloat(v); return Number.isFinite(n) ? n : null; }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ref = new URL(supabaseUrl).hostname.split(".")[0];
const postgres = (await import("postgres")).default;
const sql = postgres({
  host: `db.${ref}.supabase.co`, port: 5432, database: "postgres", username: "postgres",
  password: process.env.DATABASE_PASSWORD, ssl: "require",
});

try {
  console.log("══════════════════════════════════════════════════════════════");
  console.log("Initial Sync Lhorlogemurale → cache Supabase");
  console.log("══════════════════════════════════════════════════════════════\n");

  const [integ] = await sql`SELECT id FROM public.integrations WHERE user_id=${GABRIEL}::uuid AND provider='shopify' LIMIT 1`;
  if (!integ) { console.error("✗ Integration introuvable"); process.exit(1); }
  const INTEG_ID = integ.id;
  console.log(`Integration ID : ${INTEG_ID}\n`);

  const token = await mint();

  // ── Orders ──
  console.log("→ Sync orders...");
  let cursor = null, totalOrders = 0;
  do {
    const data = await gql(token, QO, { first: 50, after: cursor });
    const rows = data.orders.edges.map(({ node }) => {
      const fv = node.customerJourneySummary?.firstVisit;
      const utm = fv?.utmParameters;
      const li = node.lineItems.edges.map(({ node: l }) => ({
        id: gidId(l.id), product_id: gidId(l.product?.id), variant_id: gidId(l.variant?.id),
        title: l.title, variant_title: l.variantTitle, quantity: l.quantity,
        price: num(l.originalUnitPriceSet?.shopMoney?.amount) ?? 0,
        total_discount: num(l.totalDiscountSet?.shopMoney?.amount) ?? 0,
        sku: l.sku, vendor: l.vendor, image_url: l.variant?.image?.url ?? null,
      }));
      return {
        integration_id: INTEG_ID,
        shopify_order_id: gidId(node.id),
        order_number: node.name?.replace(/^#/, ""),
        name: node.name,
        total_price: num(node.totalPriceSet?.shopMoney?.amount),
        subtotal_price: num(node.subtotalPriceSet?.shopMoney?.amount),
        total_tax: num(node.totalTaxSet?.shopMoney?.amount),
        total_shipping: num(node.totalShippingPriceSet?.shopMoney?.amount),
        total_discounts: num(node.totalDiscountsSet?.shopMoney?.amount),
        currency: node.currencyCode,
        financial_status: node.displayFinancialStatus?.toLowerCase() ?? null,
        fulfillment_status: node.displayFulfillmentStatus?.toLowerCase() ?? null,
        customer_id: gidId(node.customer?.id),
        email: node.email ?? node.customer?.email ?? null,
        phone: node.phone,
        line_items: JSON.stringify(li),
        shipping_address: node.shippingAddress ? JSON.stringify(node.shippingAddress) : null,
        billing_address: null,
        tags: node.tags ?? [],
        source_name: node.sourceName,
        referring_site: fv?.referrerUrl ?? null,
        landing_site: fv?.landingPage ?? null,
        utm_source: utm?.source ?? null,
        utm_medium: utm?.medium ?? null,
        utm_campaign: utm?.campaign ?? null,
        created_at: node.createdAt,
        updated_at: node.updatedAt,
        processed_at: node.processedAt,
        cancelled_at: node.cancelledAt,
      };
    });
    for (const r of rows) {
      await sql`
        INSERT INTO public.shopify_orders ${sql(r)}
        ON CONFLICT (integration_id, shopify_order_id) DO UPDATE SET
          updated_at = EXCLUDED.updated_at,
          financial_status = EXCLUDED.financial_status,
          fulfillment_status = EXCLUDED.fulfillment_status,
          total_price = EXCLUDED.total_price,
          line_items = EXCLUDED.line_items
      `;
    }
    totalOrders += rows.length;
    cursor = data.orders.pageInfo.hasNextPage ? data.orders.pageInfo.endCursor : null;
  } while (cursor);
  console.log(`  ✓ ${totalOrders} commandes synced`);

  // ── Products ──
  console.log("→ Sync products...");
  cursor = null;
  let totalProducts = 0;
  do {
    const data = await gql(token, QP, { first: 50, after: cursor });
    const rows = data.products.edges.map(({ node }) => ({
      integration_id: INTEG_ID,
      shopify_product_id: gidId(node.id),
      title: node.title, handle: node.handle, description: node.description,
      product_type: node.productType, vendor: node.vendor, status: node.status,
      tags: node.tags ?? [],
      variants: JSON.stringify(node.variants.edges.map(({ node: v }) => ({
        id: gidId(v.id), title: v.title, sku: v.sku,
        price: num(v.price) ?? 0, compare_at_price: num(v.compareAtPrice),
        inventory_quantity: v.inventoryQuantity ?? 0, inventory_management: null, position: v.position,
      }))),
      images: JSON.stringify(node.images.edges.map(({ node: i }) => ({ url: i.url, alt: i.altText }))),
      featured_image_url: node.featuredImage?.url ?? null,
      price_min: num(node.priceRangeV2?.minVariantPrice?.amount),
      price_max: num(node.priceRangeV2?.maxVariantPrice?.amount),
      total_inventory: node.totalInventory,
      created_at: node.createdAt, updated_at: node.updatedAt, published_at: node.publishedAt,
    }));
    for (const r of rows) {
      await sql`
        INSERT INTO public.shopify_products ${sql(r)}
        ON CONFLICT (integration_id, shopify_product_id) DO UPDATE SET
          title = EXCLUDED.title, status = EXCLUDED.status, total_inventory = EXCLUDED.total_inventory,
          variants = EXCLUDED.variants, images = EXCLUDED.images, updated_at = EXCLUDED.updated_at
      `;
    }
    totalProducts += rows.length;
    cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
  } while (cursor);
  console.log(`  ✓ ${totalProducts} produits synced`);

  // ── Customers ──
  console.log("→ Sync customers...");
  cursor = null;
  let totalCustomers = 0;
  do {
    const data = await gql(token, QC, { first: 50, after: cursor });
    const rows = data.customers.edges.map(({ node }) => ({
      integration_id: INTEG_ID,
      shopify_customer_id: gidId(node.id),
      email: node.email, first_name: node.firstName, last_name: node.lastName, phone: node.phone,
      orders_count: parseInt(node.numberOfOrders ?? "0", 10),
      total_spent: num(node.amountSpent?.amount) ?? 0,
      currency: node.amountSpent?.currencyCode ?? "EUR",
      accepts_marketing: node.emailMarketingConsent?.marketingState === "SUBSCRIBED",
      addresses: JSON.stringify(node.addresses ?? []),
      default_address: node.defaultAddress ? JSON.stringify(node.defaultAddress) : null,
      tags: node.tags ?? [],
      created_at: node.createdAt, updated_at: node.updatedAt,
    }));
    for (const r of rows) {
      await sql`
        INSERT INTO public.shopify_customers ${sql(r)}
        ON CONFLICT (integration_id, shopify_customer_id) DO UPDATE SET
          email = EXCLUDED.email, orders_count = EXCLUDED.orders_count, total_spent = EXCLUDED.total_spent,
          updated_at = EXCLUDED.updated_at
      `;
    }
    totalCustomers += rows.length;
    cursor = data.customers.pageInfo.hasNextPage ? data.customers.pageInfo.endCursor : null;
  } while (cursor);
  console.log(`  ✓ ${totalCustomers} clients synced`);

  // ── Sync state ──
  const now = new Date().toISOString();
  await sql`
    INSERT INTO public.shopify_sync_state (integration_id, initial_sync_completed, initial_sync_started_at, initial_sync_completed_at,
                                            last_orders_sync_at, last_products_sync_at, last_customers_sync_at)
    VALUES (${INTEG_ID}, true, ${now}, ${now}, ${now}, ${now}, ${now})
    ON CONFLICT (integration_id) DO UPDATE SET
      initial_sync_completed = true, initial_sync_completed_at = ${now},
      last_orders_sync_at = ${now}, last_products_sync_at = ${now}, last_customers_sync_at = ${now}
  `;
  await sql`UPDATE public.integrations SET last_sync_at = ${now} WHERE id = ${INTEG_ID}`;

  console.log(`\n✅ Initial sync terminé`);
  console.log(`   ${totalOrders} commandes / ${totalProducts} produits / ${totalCustomers} clients`);
} finally {
  await sql.end();
}

#!/usr/bin/env node
/**
 * Souscrit les 13 topics webhooks Shopify pour Lhorlogemurale.
 * Idempotent : skip un topic s'il existe déjà avec le même endpoint.
 *
 * Usage :
 *   WEBHOOK_ENDPOINT_URL=https://jestly.fr/api/ecom/webhooks/shopify \
 *     node scripts/subscribe-shopify-webhooks.mjs
 *
 * Pour dev (ngrok / vercel preview), passer un autre WEBHOOK_ENDPOINT_URL.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
for (const line of envContent.split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const eq = line.indexOf("=");
  if (eq < 0) continue;
  const key = line.slice(0, eq).trim();
  let value = line.slice(eq + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = value;
}

const ENDPOINT = process.env.WEBHOOK_ENDPOINT_URL ?? "https://jestly.fr/api/ecom/webhooks/shopify";
const SHOP = process.env.SHOPIFY_LHORLOGEMURALE_SHOP_DOMAIN;
const CLIENT_ID = process.env.SHOPIFY_LHORLOGEMURALE_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_LHORLOGEMURALE_CLIENT_SECRET;
const API_VERSION = process.env.SHOPIFY_LHORLOGEMURALE_API_VERSION ?? "2025-01";

if (!SHOP || !CLIENT_ID || !CLIENT_SECRET) {
  console.error("✗ Env SHOPIFY_LHORLOGEMURALE_* manquantes");
  process.exit(1);
}

const TOPICS = [
  "ORDERS_CREATE", "ORDERS_UPDATED", "ORDERS_CANCELLED", "ORDERS_PAID", "ORDERS_FULFILLED",
  "PRODUCTS_CREATE", "PRODUCTS_UPDATE", "PRODUCTS_DELETE",
  "CUSTOMERS_CREATE", "INVENTORY_LEVELS_UPDATE",
  "CHECKOUTS_CREATE", "CHECKOUTS_UPDATE",
  "APP_UNINSTALLED",
];

// ── Mint token ───────────────────────────────────────────────────
async function mintToken() {
  const res = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  if (!res.ok) throw new Error(`Token grant failed: ${res.status} ${await res.text()}`);
  const j = await res.json();
  return j.access_token;
}

async function gql(token, query, variables) {
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const j = await res.json();
  if (j.errors) throw new Error(`GraphQL: ${JSON.stringify(j.errors)}`);
  return j.data;
}

const QUERY_EXISTING = `
  query Subs { webhookSubscriptions(first: 100) { edges { node {
    id topic
    endpoint { __typename ... on WebhookHttpEndpoint { callbackUrl } }
  } } } }
`;

const MUT_CREATE = `
  mutation Create($topic: WebhookSubscriptionTopic!, $callbackUrl: URL!) {
    webhookSubscriptionCreate(
      topic: $topic
      webhookSubscription: { callbackUrl: $callbackUrl, format: JSON }
    ) {
      webhookSubscription { id topic }
      userErrors { field message }
    }
  }
`;

// ── Run ──────────────────────────────────────────────────────────
console.log("══════════════════════════════════════════════════════════════");
console.log("Souscription webhooks Shopify Lhorlogemurale");
console.log("══════════════════════════════════════════════════════════════");
console.log(`Endpoint : ${ENDPOINT}`);
console.log(`Topics   : ${TOPICS.length}\n`);

const token = await mintToken();
const existing = await gql(token, QUERY_EXISTING);
const subscribed = new Map();
for (const e of existing.webhookSubscriptions.edges) {
  const url = e.node.endpoint?.callbackUrl ?? "";
  subscribed.set(`${e.node.topic}|${url}`, e.node.id);
}

const created = [];
const skipped = [];
const errors = [];

for (const topic of TOPICS) {
  const key = `${topic}|${ENDPOINT}`;
  if (subscribed.has(key)) {
    skipped.push(topic);
    console.log(`⊘ ${topic.padEnd(28)} — déjà souscrit`);
    continue;
  }
  try {
    const res = await gql(token, MUT_CREATE, { topic, callbackUrl: ENDPOINT });
    const data = res.webhookSubscriptionCreate;
    if (data.userErrors?.length) {
      errors.push({ topic, errors: data.userErrors });
      console.log(`✗ ${topic.padEnd(28)} — ${data.userErrors.map((e) => e.message).join("; ")}`);
    } else {
      created.push({ topic, id: data.webhookSubscription.id });
      console.log(`✓ ${topic.padEnd(28)} — ${data.webhookSubscription.id}`);
    }
  } catch (err) {
    errors.push({ topic, errors: [{ message: err.message }] });
    console.log(`✗ ${topic.padEnd(28)} — ${err.message}`);
  }
}

console.log(`\n──────────────────────────────────────────────────────────────`);
console.log(`Créés   : ${created.length}`);
console.log(`Skipped : ${skipped.length} (déjà existants)`);
console.log(`Erreurs : ${errors.length}`);

// Update integrations.webhooks_subscribed
if (created.length > 0 || skipped.length > 0) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const ref = new URL(supabaseUrl).hostname.split(".")[0];
  const postgres = (await import("postgres")).default;
  const sql = postgres({
    host: `db.${ref}.supabase.co`,
    port: 5432,
    database: "postgres",
    username: "postgres",
    password: process.env.DATABASE_PASSWORD,
    ssl: "require",
  });
  try {
    const allTopics = [...created.map((c) => c.topic), ...skipped];
    await sql`
      UPDATE public.integrations
      SET webhooks_subscribed = ${allTopics}
      WHERE provider = 'shopify' AND shop_domain = ${SHOP}
    `;
    console.log(`\n✓ integrations.webhooks_subscribed mis à jour (${allTopics.length} topics)`);
  } finally {
    await sql.end();
  }
}

if (errors.length === 0) {
  console.log("\n✅ Tous les webhooks sont opérationnels");
} else {
  console.log("\n⚠️ Certains topics ont échoué — voir détails ci-dessus");
  process.exit(1);
}

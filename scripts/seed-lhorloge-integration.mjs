#!/usr/bin/env node
/**
 * Seed la ligne `integrations` Shopify pour Gabriel (Lhorlogemurale).
 * Idempotent : update si la ligne existe déjà.
 *
 * Usage : node scripts/seed-lhorloge-integration.mjs
 * Requiert :
 *   SHOPIFY_LHORLOGEMURALE_SHOP_DOMAIN
 *   SHOPIFY_LHORLOGEMURALE_CLIENT_ID
 *   SHOPIFY_LHORLOGEMURALE_CLIENT_SECRET
 *   SHOPIFY_LHORLOGEMURALE_API_VERSION
 *   ENCRYPTION_KEY (32 bytes en base64) OU ENCRYPTION_MASTER_KEY
 *   NEXT_PUBLIC_SUPABASE_URL + DATABASE_PASSWORD
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCipheriv, randomBytes, scryptSync, createDecipheriv } from "node:crypto";

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

const GABRIEL_USER_ID = "ef7a948f-2fab-41da-a5aa-a9f0b558adf0";

const SCOPES = [
  "read_orders", "read_all_orders", "read_products", "read_product_listings",
  "read_customers", "read_inventory", "read_locations", "read_analytics",
  "read_reports", "read_fulfillments", "read_shipping", "read_marketing_events",
  "read_publications", "read_price_rules", "read_discounts", "read_checkouts",
];

const requiredEnv = [
  "SHOPIFY_LHORLOGEMURALE_SHOP_DOMAIN",
  "SHOPIFY_LHORLOGEMURALE_CLIENT_ID",
  "SHOPIFY_LHORLOGEMURALE_CLIENT_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "DATABASE_PASSWORD",
];
for (const k of requiredEnv) {
  if (!process.env[k]) { console.error(`✗ env manquante : ${k}`); process.exit(1); }
}

const shopDomain = process.env.SHOPIFY_LHORLOGEMURALE_SHOP_DOMAIN;
const clientId = process.env.SHOPIFY_LHORLOGEMURALE_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_LHORLOGEMURALE_CLIENT_SECRET;
const apiVersion = process.env.SHOPIFY_LHORLOGEMURALE_API_VERSION ?? "2025-01";

// ── Chiffrement local (mirror de lib/encryption.ts) ──────────────
function getKey() {
  if (process.env.ENCRYPTION_KEY) {
    const k = Buffer.from(process.env.ENCRYPTION_KEY, "base64");
    if (k.length !== 32) throw new Error(`ENCRYPTION_KEY doit faire 32 bytes (base64). Got ${k.length}`);
    return k;
  }
  if (process.env.ENCRYPTION_MASTER_KEY) {
    return scryptSync(process.env.ENCRYPTION_MASTER_KEY, "jestly-integrations-salt-v1", 32);
  }
  throw new Error("ENCRYPTION_KEY ou ENCRYPTION_MASTER_KEY manquant");
}

function encryptToString(plaintext) {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString("base64");
}

function decryptFromString(encoded) {
  const key = getKey();
  const buf = Buffer.from(encoded, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ct = buf.subarray(28);
  const dec = createDecipheriv("aes-256-gcm", key, iv);
  dec.setAuthTag(tag);
  return Buffer.concat([dec.update(ct), dec.final()]).toString("utf8");
}

// ── Round-trip sanity check ──────────────────────────────────────
const encrypted = encryptToString(clientSecret);
const decrypted = decryptFromString(encrypted);
if (decrypted !== clientSecret) {
  console.error("✗ Round-trip chiffrement échoué");
  process.exit(1);
}
console.log("✓ Round-trip chiffrement OK");

// ── Connexion DB ─────────────────────────────────────────────────
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

console.log("\n══════════════════════════════════════════════════════════════");
console.log("Seed integrations row — Lhorlogemurale (Gabriel)");
console.log("══════════════════════════════════════════════════════════════");

try {
  const metadata = {
    auth: "client_credentials",
    client_id: clientId,
    api_version: apiVersion,
    shop_name: "L'Horloge Murale",
  };

  const existing = await sql`
    SELECT id FROM public.integrations
    WHERE user_id = ${GABRIEL_USER_ID}::uuid
      AND provider = 'shopify'
      AND shop_domain = ${shopDomain}
  `;

  let id;
  if (existing.length > 0) {
    id = existing[0].id;
    await sql`
      UPDATE public.integrations
      SET secret_encrypted = ${encrypted},
          scopes = ${SCOPES},
          metadata = ${JSON.stringify(metadata)}::jsonb,
          status = 'active',
          last_error = null
      WHERE id = ${id}
    `;
    console.log(`✓ Integration mise à jour : ${id}`);
  } else {
    const inserted = await sql`
      INSERT INTO public.integrations
        (user_id, provider, shop_domain, secret_encrypted, scopes, metadata, status)
      VALUES
        (${GABRIEL_USER_ID}::uuid, 'shopify', ${shopDomain}, ${encrypted},
         ${SCOPES}, ${JSON.stringify(metadata)}::jsonb, 'active')
      RETURNING id
    `;
    id = inserted[0].id;
    console.log(`✓ Integration insérée : ${id}`);
  }

  // Vérif déchiffrement après écriture
  const check = await sql`SELECT secret_encrypted FROM public.integrations WHERE id = ${id}`;
  const reDecrypted = decryptFromString(check[0].secret_encrypted);
  if (reDecrypted === clientSecret) {
    console.log("✓ Vérification round-trip DB OK");
  } else {
    console.error("✗ Vérification round-trip DB ÉCHOUÉE");
    process.exit(1);
  }

  console.log(`\nIntegration ID : ${id}`);
  console.log(`Shop domain    : ${shopDomain}`);
  console.log(`Scopes         : ${SCOPES.length}/16`);
  console.log(`User           : Gabriel (${GABRIEL_USER_ID})`);
  console.log("\n✅ Seed terminé. Le dashboard /ecom est prêt à charger.");
} finally {
  await sql.end();
}

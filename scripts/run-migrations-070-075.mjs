#!/usr/bin/env node
/**
 * Applique les 6 migrations ecom V1 (post-pgsodium) sur la base de prod.
 * 070 (drop pgsodium), 071 (integrations sans pgsodium), 072 (shopify cache),
 * 073 (webhook events), 074 (RLS), 075 (sync state).
 *
 * Usage : node scripts/run-migrations-070-075.mjs
 * Requiert : DATABASE_PASSWORD + NEXT_PUBLIC_SUPABASE_URL dans .env.local
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.env.DATABASE_PASSWORD;
if (!supabaseUrl || !dbPassword) {
  console.error("✗ Missing NEXT_PUBLIC_SUPABASE_URL or DATABASE_PASSWORD");
  process.exit(1);
}

const ref = new URL(supabaseUrl).hostname.split(".")[0];
const postgres = (await import("postgres")).default;
const sql = postgres({
  host: `db.${ref}.supabase.co`,
  port: 5432,
  database: "postgres",
  username: "postgres",
  password: dbPassword,
  ssl: "require",
});

const MIGRATIONS = [
  "070_drop_pgsodium_setup.sql",
  "071_create_integrations_table.sql",
  "072_create_shopify_cache_tables.sql",
  "073_create_webhook_events_table.sql",
  "074_rls_policies_ecom.sql",
  "075_sync_state_table.sql",
];

console.log("══════════════════════════════════════════════════════════════");
console.log("Application migrations ecom V1 (070-075) sur prod");
console.log("══════════════════════════════════════════════════════════════");
console.log(`Host : db.${ref}.supabase.co\n`);

try {
  for (const file of MIGRATIONS) {
    const sqlPath = path.join(__dirname, "..", "supabase", "migrations", file);
    if (!fs.existsSync(sqlPath)) {
      console.log(`⊘ ${file} introuvable, skip`);
      continue;
    }
    const content = fs.readFileSync(sqlPath, "utf-8");
    process.stdout.write(`→ ${file} ... `);
    try {
      await sql.unsafe(content);
      console.log("✓");
    } catch (err) {
      console.log(`✗\n  ERROR: ${err.message}`);
      throw err;
    }
  }

  console.log("\n── Vérifications post-migration ──");

  const pgsodium = await sql`SELECT extname FROM pg_extension WHERE extname = 'pgsodium'`;
  console.log(`pgsodium installé    : ${pgsodium.length > 0 ? "⚠️ OUI (devrait être absent)" : "✓ Non"}`);

  const integrationsCount = await sql`SELECT COUNT(*)::int AS c FROM public.integrations`;
  console.log(`integrations rows    : ${integrationsCount[0].c}`);

  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('integrations', 'shopify_orders', 'shopify_products',
                         'shopify_customers', 'shopify_sessions_daily',
                         'shopify_analytics_daily', 'shopify_webhook_events',
                         'shopify_sync_state')
    ORDER BY table_name
  `;
  console.log(`Tables ecom créées   : ${tables.length}/8`);
  for (const t of tables) console.log(`  ✓ ${t.table_name}`);

  console.log("\n✅ Migrations appliquées avec succès");
} finally {
  await sql.end();
}

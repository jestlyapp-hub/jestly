#!/usr/bin/env node
/**
 * Applique les 5 migrations Ads V2 (081-085) sur la base de prod.
 * Idempotent (toutes les migrations utilisent IF NOT EXISTS / DROP IF EXISTS).
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

const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const postgres = (await import("postgres")).default;
const sql = postgres({
  host: `db.${ref}.supabase.co`, port: 5432, database: "postgres",
  username: "postgres", password: process.env.DATABASE_PASSWORD, ssl: "require",
});

const MIGRATIONS = [
  "081_create_ecom_settings.sql",
  "082_create_campaign_performance_daily.sql",
  "083_create_attribution_touches.sql",
  "084_create_ad_creative_performance.sql",
  "085_create_ads_alerts.sql",
];

console.log("══════════════════════════════════════════════════════════════");
console.log("Migrations Ads V2 (081-085) sur prod");
console.log("══════════════════════════════════════════════════════════════\n");

try {
  for (const file of MIGRATIONS) {
    const p = path.join(__dirname, "..", "supabase", "migrations", file);
    process.stdout.write(`→ ${file} ... `);
    try {
      await sql.unsafe(fs.readFileSync(p, "utf-8"));
      console.log("✓");
    } catch (err) {
      console.log(`✗ ${err.message}`);
      throw err;
    }
  }

  console.log("\n── Vérifications post-migration ──");
  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('ecom_settings', 'campaign_performance_daily',
                         'order_attribution_touches', 'ad_creative_performance_daily',
                         'ads_alerts')
    ORDER BY table_name
  `;
  console.log(`Tables Ads V2 créées : ${tables.length}/5`);
  for (const t of tables) console.log(`  ✓ ${t.table_name}`);

  console.log("\n✅ Migrations Ads V2 appliquées");
} finally {
  await sql.end();
}

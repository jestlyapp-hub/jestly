#!/usr/bin/env node
/**
 * Applique un fichier de migration Supabase passé en argument.
 * Usage : node scripts/apply-migration.mjs 079_create_pinterest_tables.sql
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = process.argv[2];
if (!file) { console.error("Usage: node scripts/apply-migration.mjs <file.sql>"); process.exit(1); }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.env.DATABASE_PASSWORD;
if (!supabaseUrl || !dbPassword) { console.error("Missing NEXT_PUBLIC_SUPABASE_URL or DATABASE_PASSWORD"); process.exit(1); }

const ref = new URL(supabaseUrl).hostname.split(".")[0];
const sql = (await import("postgres")).default({
  host: `db.${ref}.supabase.co`, port: 5432, database: "postgres",
  username: "postgres", password: dbPassword, ssl: "require", connect_timeout: 30, max: 1,
});

try {
  const content = fs.readFileSync(path.join(__dirname, "..", "supabase", "migrations", file), "utf8");
  await sql.unsafe(content);
  console.log(`  ✓ ${file} appliqué`);
} catch (e) {
  console.error(`Migration ${file} échouée:`, e.message);
  process.exit(1);
} finally {
  await sql.end();
}

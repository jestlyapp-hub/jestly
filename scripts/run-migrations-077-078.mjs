#!/usr/bin/env node
/**
 * Applique les migrations 077 (oauth_states) + 078 (integrations oauth columns)
 * à la base Supabase. Idempotent (IF NOT EXISTS / do-exception sur les policies).
 *
 * Usage : node scripts/run-migrations-077-078.mjs
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.env.DATABASE_PASSWORD;
if (!supabaseUrl || !dbPassword) { console.error("Missing NEXT_PUBLIC_SUPABASE_URL or DATABASE_PASSWORD"); process.exit(1); }

const ref = new URL(supabaseUrl).hostname.split(".")[0];
const sql = (await import("postgres")).default({
  host: `db.${ref}.supabase.co`, port: 5432, database: "postgres",
  username: "postgres", password: dbPassword, ssl: "require", connect_timeout: 30, max: 1,
});

const files = ["077_create_oauth_states.sql", "078_integrations_oauth_columns.sql"];
try {
  for (const f of files) {
    const content = fs.readFileSync(path.join(__dirname, "..", "supabase", "migrations", f), "utf8");
    await sql.unsafe(content);
    console.log(`  ✓ ${f}`);
  }
  console.log("Migrations 077-078 OK");
} catch (e) {
  console.error("Migration failed:", e.message);
  process.exit(1);
} finally {
  await sql.end();
}

/**
 * Jestly — Apply all migrations to Supabase.
 *
 * Usage:
 *   node scripts/migrate.mjs YOUR_DATABASE_PASSWORD
 *
 * Or set DATABASE_PASSWORD in .env.local:
 *   DATABASE_PASSWORD=your_password_here
 *
 * Find your database password at:
 *   https://supabase.com/dashboard/project/aaxyqzohtzvstpqxlvsr/settings/database
 *   → Section "Connection string" → Password
 */

import postgres from "postgres";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = join(__dirname, "..", ".env.local");
let envVars = {};
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (key && val) envVars[key] = val;
    }
  }
} catch {}

const PASSWORD = process.argv[2] || envVars.DATABASE_PASSWORD;
const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL || "";
const PROJECT_REF = SUPABASE_URL.replace("https://", "").split(".")[0] || "aaxyqzohtzvstpqxlvsr";

if (!PASSWORD) {
  console.error(`
  ╔═════════════════════════════════════════════════════════════╗
  ║  Jestly — Migration Script                                 ║
  ╠═════════════════════════════════════════════════════════════╣
  ║                                                             ║
  ║  Usage:  node scripts/migrate.mjs MOT_DE_PASSE              ║
  ║                                                             ║
  ║  Ou ajoute dans .env.local :                                ║
  ║  DATABASE_PASSWORD=ton_mot_de_passe                         ║
  ║                                                             ║
  ║  Trouve ton mot de passe ici :                              ║
  ║  Supabase Dashboard > Settings > Database                   ║
  ║  Section "Connection string" > mot de passe                 ║
  ║                                                             ║
  ║  Lien direct :                                              ║
  ║  https://supabase.com/dashboard/project/${PROJECT_REF}/     ║
  ║  settings/database                                          ║
  ╚═════════════════════════════════════════════════════════════╝
`);
  process.exit(1);
}

const HOST = `db.${PROJECT_REF}.supabase.co`;

async function main() {
  console.log("\n  Jestly — Applying migrations...\n");
  console.log(`  Host:     ${HOST}`);
  console.log(`  Project:  ${PROJECT_REF}`);
  console.log(`  Database: postgres\n`);

  const sql = postgres({
    host: HOST,
    port: 5432,
    database: "postgres",
    username: "postgres",
    password: PASSWORD,
    ssl: "require",
    connect_timeout: 15,
  });

  // Test connection
  try {
    await sql`SELECT 1 as test`;
    console.log("  Connection OK\n");
  } catch (e) {
    console.error(`  Connection FAILED: ${e.message}`);
    console.error("\n  Verifie ton mot de passe et reessaie.");
    await sql.end();
    process.exit(1);
  }

  // Run each migration file in order
  const migrations = [
    "001_initial_schema.sql",
    "002_site_builder.sql",
    "003_checkout_flow.sql",
    "004_client_detail.sql",
    "005_client_email_unique.sql",
    "006_fix_handle_new_user.sql",
    "007_kanban_statuses.sql",
    "008_custom_workflow.sql",
    "009_fix_orders_statuses.sql",
    "010_ensure_workflow_tables.sql",
    "011_order_freelance_fields.sql",
    "012_dynamic_columns.sql",
    "013_hide_default_seeded_fields.sql",
    "014_subdomain_settings.sql",
    "015_site_versions.sql",
    "016_product_enhancements.sql",
    "017_rename_services_to_products.sql",
    "018_briefs.sql",
    "019_briefs_v2.sql",
    "020_briefs_public_access.sql",
    "021_brief_field_mapping.sql",
    "022_sites_design_column.sql",
  ];

  const migrationsDir = join(__dirname, "..", "supabase", "migrations");
  let allOk = true;

  for (const file of migrations) {
    const path = join(migrationsDir, file);
    let content;
    try {
      content = readFileSync(path, "utf-8");
    } catch {
      console.log(`  [${file}] SKIP (fichier introuvable)`);
      continue;
    }

    process.stdout.write(`  [${file}] `);

    try {
      await sql.unsafe(content);
      console.log("OK");
    } catch (e) {
      const msg = e.message || "";
      // "already exists" is fine for idempotent re-runs
      if (msg.includes("already exists") || msg.includes("duplicate key")) {
        console.log("OK (deja applique)");
      } else {
        console.log("ERREUR");
        console.error(`    → ${msg.split("\n")[0]}`);
        allOk = false;
      }
    }
  }

  // Reload PostgREST schema cache
  try {
    await sql.unsafe("NOTIFY pgrst, 'reload schema'");
    console.log("\n  Schema cache reloaded");
  } catch {}

  await sql.end();

  if (allOk) {
    console.log("\n  Toutes les migrations sont appliquees !");
    console.log("  → http://localhost:3000/setup pour verifier");
    console.log("  → http://localhost:3000/login pour commencer\n");
  } else {
    console.log("\n  Certaines migrations ont echoue.");
    console.log("  Verifie les erreurs ci-dessus et reessaie.\n");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});

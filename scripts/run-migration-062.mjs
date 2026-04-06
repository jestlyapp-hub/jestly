/**
 * Exécute la migration 062_notifications via l'API Supabase Management.
 * Utilise le service_role key pour insérer directement via l'API REST.
 *
 * Usage: node scripts/run-migration-062.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = join(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const idx = line.indexOf("=");
  if (idx > 0) {
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (k && v) envVars[k] = v;
  }
}

const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
const key = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log("\n  Migration 062 — Notifications\n");

  // Step 1: Check if table already exists
  const { error: checkErr } = await supabase.from("notifications").select("id").limit(0);

  if (!checkErr) {
    console.log("  ✓ Table 'notifications' existe déjà.");

    // Verify columns
    const { data: testInsert, error: insertErr } = await supabase
      .from("notifications")
      .insert({
        user_id: "00000000-0000-0000-0000-000000000000",
        type: "__test__",
        category: "system",
        title: "test",
        message: "test",
        idempotency_key: "__migration_test__",
      })
      .select("id")
      .single();

    if (insertErr && insertErr.message.includes("violates foreign key")) {
      console.log("  ✓ Schema correct (FK constraint fonctionne).");
    } else if (testInsert) {
      // Clean up test row
      await supabase.from("notifications").delete().eq("id", testInsert.id);
      console.log("  ✓ Table et colonnes OK.");
    }

    console.log("\n  Migration déjà appliquée. Rien à faire.\n");
    return;
  }

  if (checkErr.message.includes("Could not find the table")) {
    console.log("  Table 'notifications' n'existe pas encore.");
    console.log("  La migration SQL doit être exécutée manuellement.");
    console.log("\n  Options :");
    console.log("  1. Supabase Dashboard → SQL Editor → coller le contenu de :");
    console.log("     supabase/migrations/062_notifications.sql");
    console.log("\n  2. Ou utiliser le script migrate.mjs avec DATABASE_PASSWORD :");
    console.log("     node scripts/migrate.mjs MOT_DE_PASSE_DB");
    console.log("\n  Le mot de passe se trouve ici :");
    console.log("  https://supabase.com/dashboard/project/aaxyqzohtzvstpqxlvsr/settings/database\n");
  } else {
    console.error("  Erreur inattendue:", checkErr.message);
  }
}

run().catch(e => {
  console.error("Fatal:", e.message);
  process.exit(1);
});

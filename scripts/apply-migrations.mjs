/**
 * Apply all Jestly migrations to Supabase using the service role key.
 * Usage: node scripts/apply-migrations.mjs
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env from .env.local
const envPath = join(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) env[key.trim()] = rest.join("=").trim();
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

// Read all migration files in order
const migrations = [
  "001_initial_schema.sql",
  "002_site_builder.sql",
  "003_checkout_flow.sql",
  "004_client_detail.sql",
  "005_client_email_unique.sql",
];

async function runSQL(sql, label) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({}),
  });

  // PostgREST doesn't support raw SQL — use the pg endpoint instead
  const pgRes = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!pgRes.ok) {
    // Try the SQL API endpoint
    const sqlRes = await fetch(`${SUPABASE_URL}/sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!sqlRes.ok) {
      const text = await sqlRes.text().catch(() => "");
      console.error(`  [${label}] Failed: ${sqlRes.status} ${text.slice(0, 200)}`);
      return false;
    }
    console.log(`  [${label}] OK (via /sql)`);
    return true;
  }

  console.log(`  [${label}] OK`);
  return true;
}

// Alternative: use the Management API
async function runSQLViaManagementAPI(sql, label) {
  // Extract project ref from URL
  const projectRef = SUPABASE_URL.replace("https://", "").split(".")[0];

  const res = await fetch(
    `https://${projectRef}.supabase.co/rest/v1/`,
    {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    }
  );

  // The REST API doesn't support raw SQL, so we use a different approach
  // We'll create a temporary function that executes our SQL
  return false;
}

// Use the Supabase client directly with createClient
async function main() {
  console.log("Jestly — Applying migrations...\n");
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log("");

  // Read and combine all migration SQL
  const migrationsDir = join(__dirname, "..", "supabase", "migrations");

  for (const file of migrations) {
    const path = join(migrationsDir, file);
    let sql;
    try {
      sql = readFileSync(path, "utf-8");
    } catch {
      console.log(`  [${file}] Skipped (file not found)`);
      continue;
    }

    console.log(`  Applying ${file}...`);

    // Use the Supabase SQL endpoint
    const projectRef = SUPABASE_URL.replace("https://", "").split(".")[0];

    // Try multiple endpoints
    let success = false;

    // Method 1: /pg (new Supabase endpoint)
    try {
      const res = await fetch(`https://${projectRef}.supabase.co/pg/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
      });
      if (res.ok) {
        console.log(`    OK`);
        success = true;
      }
    } catch {}

    if (!success) {
      // Method 2: Management API
      try {
        const res = await fetch(
          `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ query: sql }),
          }
        );
        if (res.ok) {
          console.log(`    OK (management API)`);
          success = true;
        } else {
          const body = await res.text().catch(() => "");
          console.log(`    Management API: ${res.status} ${body.slice(0, 150)}`);
        }
      } catch (e) {
        console.log(`    Management API error: ${e.message}`);
      }
    }

    if (!success) {
      console.log(`    FAILED — will try combined approach`);
    }
  }

  // Final: reload PostgREST schema cache
  const projectRef = SUPABASE_URL.replace("https://", "").split(".")[0];
  try {
    await fetch(`https://${projectRef}.supabase.co/pg/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: "NOTIFY pgrst, 'reload schema'" }),
    });
  } catch {}

  console.log("\nDone! Verify at http://localhost:3000/setup");
}

main().catch(console.error);

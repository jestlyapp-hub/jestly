#!/usr/bin/env node
/**
 * Enregistre une boutique dans pixel_shops et imprime son pixel_id + le
 * snippet à coller dans le thème Shopify.
 *
 * Usage : node scripts/pixel-register-shop.mjs <domaine> [label] [--user <user_id>]
 * Ex.   : node scripts/pixel-register-shop.mjs lhorlogemurale.fr "L'Horloge Murale"
 *         node scripts/pixel-register-shop.mjs mignou.fr "Mignou" --user b13177ae-...
 *
 * Le propriétaire est résolu ainsi :
 *   1. --user <id> (ou env PIXEL_SHOP_USER_ID) si fourni ;
 *   2. sinon, l'UNIQUE utilisateur Shopify actif (échoue si plusieurs — cas
 *      multi-tenant : préciser --user).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
for (const line of fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf-8").split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const eq = line.indexOf("="); if (eq < 0) continue;
  const k = line.slice(0, eq).trim();
  let v = line.slice(eq + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  if (!process.env[k]) process.env[k] = v;
}

const args = process.argv.slice(2);
const userFlagIdx = args.indexOf("--user");
let explicitUserId = process.env.PIXEL_SHOP_USER_ID ?? null;
if (userFlagIdx >= 0) {
  explicitUserId = args[userFlagIdx + 1] ?? null;
  args.splice(userFlagIdx, 2);
}
const domain = (args[0] ?? "").toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
const label = args[1] ?? domain;
if (!domain) {
  console.error("Usage : node scripts/pixel-register-shop.mjs <domaine> [label] [--user <user_id>]");
  process.exit(1);
}

const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
const postgres = (await import("postgres")).default;
const sql = postgres({
  host: `db.${ref}.supabase.co`, port: 5432, database: "postgres", username: "postgres",
  password: process.env.DATABASE_PASSWORD, ssl: "require", max: 1,
});

try {
  let userId = explicitUserId;
  if (!userId) {
    const users = await sql`SELECT DISTINCT user_id FROM public.integrations WHERE provider = 'shopify' AND status = 'active'`;
    if (users.length !== 1) {
      console.error(`✗ ${users.length} utilisateurs Shopify actifs — précise le propriétaire avec --user <user_id> (ou env PIXEL_SHOP_USER_ID)`);
      process.exit(1);
    }
    userId = users[0].user_id;
  }

  const [shop] = await sql`
    INSERT INTO public.pixel_shops (user_id, shop_domain, label)
    VALUES (${userId}, ${domain}, ${label})
    ON CONFLICT (user_id, shop_domain) DO UPDATE SET label = EXCLUDED.label, is_active = true
    RETURNING id, shop_domain, label, is_active
  `;

  console.log(`✓ Boutique enregistrée : ${shop.label} (${shop.shop_domain})`);
  console.log(`  pixel_id : ${shop.id}\n`);
  console.log("Snippet à coller dans le thème Shopify (theme.liquid, avant </head>) :\n");
  console.log(`<script src="https://jestly.fr/jestly-pixel.js" data-pixel-id="${shop.id}" defer></script>`);
} finally {
  await sql.end();
}

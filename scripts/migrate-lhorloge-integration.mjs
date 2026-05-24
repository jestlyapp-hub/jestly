#!/usr/bin/env node
/**
 * Migration one-shot : peuple metadata.client_id (+ api_version, auth, shop_name)
 * sur les intégrations Shopify où il manque, depuis les env vars SHOPIFY_LHORLOGEMURALE_*.
 *
 * Contexte : l'intégration V1 de Gabriel a été seedée sans metadata.client_id
 * (le client_id ne vivait que dans l'env var). getActiveShopifyIntegration() exige
 * metadata.client_id pour minter un token. Ce script migre la donnée AVANT qu'on
 * supprime les env vars (cf SetupModal V2 universal, STOP #2).
 *
 * Idempotent : ne touche que les lignes où metadata.client_id est absent.
 * Lit le client_id depuis SHOPIFY_LHORLOGEMURALE_CLIENT_ID (pas de secret hardcodé).
 *
 * Usage : node scripts/migrate-lhorloge-integration.mjs
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const clientId = process.env.SHOPIFY_LHORLOGEMURALE_CLIENT_ID;
const apiVersion = process.env.SHOPIFY_LHORLOGEMURALE_API_VERSION ?? "2025-01";
const shopDomain = process.env.SHOPIFY_LHORLOGEMURALE_SHOP_DOMAIN;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.env.DATABASE_PASSWORD;

if (!supabaseUrl || !dbPassword) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or DATABASE_PASSWORD");
  process.exit(1);
}
if (!clientId) {
  console.log("SHOPIFY_LHORLOGEMURALE_CLIENT_ID absent — rien à migrer (déjà nettoyé ?). Skip.");
  process.exit(0);
}

const ref = new URL(supabaseUrl).hostname.split(".")[0];
const sql = (await import("postgres")).default({
  host: `db.${ref}.supabase.co`, port: 5432, database: "postgres",
  username: "postgres", password: dbPassword, ssl: "require", connect_timeout: 30, max: 1,
});

try {
  // Cible : lignes shopify dont metadata n'est PAS un objet jsonb propre avec client_id.
  // (Certaines lignes ont un metadata double-encodé en string, voire un array — on réécrit proprement.)
  const targets = await sql`
    SELECT id, shop_domain, jsonb_typeof(metadata) AS mtype
    FROM public.integrations
    WHERE provider = 'shopify'
      AND (jsonb_typeof(metadata) <> 'object' OR (metadata->>'client_id') IS NULL)
      ${shopDomain ? sql`AND shop_domain = ${shopDomain}` : sql``}
  `;

  if (targets.length === 0) {
    console.log("Aucune intégration à migrer (metadata.client_id déjà présent). ✓ idempotent");
    process.exit(0);
  }

  for (const t of targets) {
    // SET (pas de merge ||) pour réparer aussi les metadata corrompus (string/array).
    await sql`
      UPDATE public.integrations
      SET metadata = jsonb_build_object(
            'auth', 'client_credentials',
            'client_id', ${clientId}::text,
            'api_version', ${apiVersion}::text,
            'shop_name', 'L''Horloge Murale'
          ),
          updated_at = now()
      WHERE id = ${t.id}
    `;
    console.log(`  ✓ réparé ${t.id} (${t.shop_domain}, type metadata avant = ${t.mtype}) → metadata objet propre`);
  }
  console.log(`Migration OK : ${targets.length} ligne(s).`);
} catch (e) {
  console.error("Migration failed:", e.message);
  process.exit(1);
} finally {
  await sql.end();
}

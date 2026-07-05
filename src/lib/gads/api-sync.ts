/**
 * Sync API Google Ads → gads_daily.
 *
 * Même logique que l'import CSV : la source la plus récente FAIT FOI
 * (upsert par UNIQUE(user_id, campaign_name, date)), fenêtre glissante de
 * 30 jours re-pullée à chaque passage (Google reconsolide ses chiffres).
 * L'import CSV reste la voie de secours — les deux alimentent la même table.
 *
 * Rappel de cadrage : l'API ne ramène que ce que Google mesure (conversions
 * déclarées). Elle ne répare pas les ventes fantômes côté Shopify — le ROAS
 * décisionnel reste dépense API × CA Shopify réel en SUM/SUM période.
 */
import type { GadsCsvRow } from "./csv-parser";
import { importGadsRows, type GadsImportRecap } from "./importer";
import { getGoogleAdsConfig, searchGaql, GoogleAdsApiError, type GaqlCampaignDailyRow } from "./google-ads-client";

/** Requête reporting produit (lecture seule) : item × jour sur [from, to]. */
export function buildProductDailyQuery(fromIso: string, toIso: string): string {
  return `
    SELECT
      segments.product_item_id,
      segments.date,
      metrics.cost_micros,
      metrics.clicks,
      metrics.impressions,
      metrics.conversions,
      metrics.conversions_value
    FROM shopping_performance_view
    WHERE segments.date BETWEEN '${fromIso}' AND '${toIso}'
  `.trim();
}

/** Requête reporting (lecture seule) : campagne × jour sur [from, to]. */
export function buildCampaignDailyQuery(fromIso: string, toIso: string): string {
  return `
    SELECT
      campaign.id, campaign.name,
      segments.date,
      metrics.cost_micros,
      metrics.clicks,
      metrics.impressions,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign
    WHERE segments.date BETWEEN '${fromIso}' AND '${toIso}'
  `.trim();
}

/**
 * Mappe la réponse GAQL vers des lignes gads_daily (pur, testable).
 * - cost_micros (int64 en string) → cents : micros / 10 000
 * - conversions_value (euros) → cents : × 100
 * - deux campagnes homonymes le même jour → sommées (clé = nom + date,
 *   même règle que les doublons CSV)
 */
export function mapGaqlResults(results: GaqlCampaignDailyRow[]): { rows: GadsCsvRow[]; warnings: string[] } {
  const warnings: string[] = [];
  const byKey = new Map<string, GadsCsvRow>();

  for (const r of results) {
    const name = r.campaign?.name?.trim();
    const date = r.segments?.date;
    if (!name || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      warnings.push(`Ligne API ignorée : campagne ou date manquante (${JSON.stringify(r.campaign ?? {})})`);
      continue;
    }
    const m = r.metrics ?? {};
    const row: GadsCsvRow = {
      campaign_name: name,
      date,
      cost_cents: Math.round(Number(m.costMicros ?? 0) / 10_000),
      clicks: Math.round(Number(m.clicks ?? 0)),
      impressions: Math.round(Number(m.impressions ?? 0)),
      conversions: Math.round(Number(m.conversions ?? 0) * 100) / 100,
      conversion_value_cents: Math.round(Number(m.conversionsValue ?? 0) * 100),
    };

    const key = `${row.campaign_name}|${row.date}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.cost_cents += row.cost_cents;
      existing.clicks += row.clicks;
      existing.impressions += row.impressions;
      existing.conversions = Math.round((existing.conversions + row.conversions) * 100) / 100;
      existing.conversion_value_cents += row.conversion_value_cents;
    } else {
      byKey.set(key, row);
    }
  }

  const rows = [...byKey.values()].sort((a, b) =>
    a.date === b.date ? a.campaign_name.localeCompare(b.campaign_name) : a.date.localeCompare(b.date),
  );
  return { rows, warnings };
}

/** Ligne gads_product_daily (item × jour), mappée depuis la réponse GAQL. */
export interface GadsProductDailyRow {
  item_id: string;
  date: string;
  cost_cents: number;
  clicks: number;
  impressions: number;
  conversions: number;
  conversion_value_cents: number;
}

interface GaqlProductRow {
  segments?: { date?: string; productItemId?: string };
  metrics?: {
    costMicros?: string | number;
    clicks?: string | number;
    impressions?: string | number;
    conversions?: number;
    conversionsValue?: number;
  };
}

/**
 * Mappe la réponse shopping_performance_view (pur, testable).
 * item_id conservé BRUT ; doublons (item, jour) sommés (segments multiples).
 */
export function mapProductGaqlResults(results: GaqlProductRow[]): { rows: GadsProductDailyRow[]; warnings: string[] } {
  const warnings: string[] = [];
  const byKey = new Map<string, GadsProductDailyRow>();

  for (const r of results) {
    const itemId = r.segments?.productItemId?.trim();
    const date = r.segments?.date;
    if (!itemId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      warnings.push("Ligne produit API ignorée : item_id ou date manquant");
      continue;
    }
    const m = r.metrics ?? {};
    const row: GadsProductDailyRow = {
      item_id: itemId,
      date,
      cost_cents: Math.round(Number(m.costMicros ?? 0) / 10_000),
      clicks: Math.round(Number(m.clicks ?? 0)),
      impressions: Math.round(Number(m.impressions ?? 0)),
      conversions: Math.round(Number(m.conversions ?? 0) * 100) / 100,
      conversion_value_cents: Math.round(Number(m.conversionsValue ?? 0) * 100),
    };
    const key = `${row.item_id}|${row.date}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.cost_cents += row.cost_cents;
      existing.clicks += row.clicks;
      existing.impressions += row.impressions;
      existing.conversions = Math.round((existing.conversions + row.conversions) * 100) / 100;
      existing.conversion_value_cents += row.conversion_value_cents;
    } else {
      byKey.set(key, row);
    }
  }
  return { rows: [...byKey.values()], warnings };
}

export function isGoogleAdsApiConfigured(): boolean {
  return getGoogleAdsConfig() != null;
}

/**
 * Pull l'API Google Ads et upsert dans gads_daily pour un user.
 * @param daysBack fenêtre glissante re-pullée (défaut 30, max 90).
 */
export async function syncFromGoogleAdsApi(userId: string, daysBack = 30): Promise<GadsImportRecap> {
  const cfg = getGoogleAdsConfig();
  if (!cfg) {
    throw new GoogleAdsApiError(
      "API Google Ads non configurée : variables GOOGLE_ADS_* manquantes (voir .env.example). L'import CSV reste disponible.",
    );
  }

  const days = Math.min(Math.max(daysBack, 1), 90);
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString().slice(0, 10);

  const results = await searchGaql(cfg, buildCampaignDailyQuery(from, to));
  const { rows, warnings } = mapGaqlResults(results);

  // Note : l'API ne renvoie pas de ligne pour les jours sans aucune activité —
  // la détection de trous (importGadsRows → missing_dates) alerte comme pour le CSV.
  const recap = await importGadsRows(
    userId,
    { rows, skipped_totals: 0, warnings },
    `api:google-ads:${to}`,
  );

  // Dépense par produit (shopping_performance_view) — même sync, jamais
  // bloquant pour le grain campagne : en cas d'échec, la vue Produits
  // affichera « non disponible », pas des zéros inventés.
  try {
    const productResults = await searchGaql(cfg, buildProductDailyQuery(from, to));
    const mapped = mapProductGaqlResults(productResults);
    recap.product_rows = await upsertProductDaily(userId, mapped.rows);
    recap.warnings.push(...mapped.warnings);
  } catch (e) {
    recap.warnings.push(
      `Dépense par produit non actualisée (shopping_performance_view) : ${(e as Error).message.slice(0, 200)}`,
    );
  }

  return recap;
}

/** Upsert des lignes produit — la source la plus récente fait foi. */
async function upsertProductDaily(userId: string, rows: GadsProductDailyRow[]): Promise<number> {
  if (rows.length === 0) return 0;
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();
  const importedAt = new Date().toISOString();
  const payload = rows.map((r) => ({ user_id: userId, ...r, imported_at: importedAt }));
  const CHUNK = 500;
  for (let i = 0; i < payload.length; i += CHUNK) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("gads_product_daily") as any)
      .upsert(payload.slice(i, i + CHUNK), { onConflict: "user_id,item_id,date" });
    if (error) throw new Error(`Upsert gads_product_daily échoué : ${error.message}`);
  }
  return payload.length;
}

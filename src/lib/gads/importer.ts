/**
 * Import incrémental des lignes CSV Google Ads dans gads_daily.
 *
 * Choix validé : le CSV le plus récent FAIT FOI. Chaque (campagne, jour) du
 * CSV est UPSERT et écrase les valeurs existantes — Google reconsolide ses
 * chiffres sur plusieurs jours, réimporter une plage converge donc toujours
 * vers la dernière version. Rien n'est perdu.
 *
 * Après import : récap clair (lignes ajoutées / écrasées, plage couverte)
 * + détection des trous (jours sans aucune donnée Ads dans la plage min→max).
 * Les trous ne sont JAMAIS interpolés : on alerte pour réexporter le CSV.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import type { GadsCsvParseResult, GadsCsvRow } from "./csv-parser";

export interface GadsImportRecap {
  rows_in_csv: number;
  rows_added: number;
  rows_updated: number;
  new_dates: string[];
  range: { from: string; to: string } | null;
  campaigns_count: number;
  skipped_totals: number;
  warnings: string[];
  missing_dates: string[];
}

const rowKey = (r: { campaign_name: string; date: string }): string => `${r.campaign_name}|${r.date}`;

/** Classe les lignes du CSV en ajouts vs mises à jour (pur, testable). */
export function classifyRows(
  rows: GadsCsvRow[],
  existingKeys: Set<string>,
): { added: GadsCsvRow[]; updated: GadsCsvRow[] } {
  const added: GadsCsvRow[] = [];
  const updated: GadsCsvRow[] = [];
  for (const r of rows) (existingKeys.has(rowKey(r)) ? updated : added).push(r);
  return { added, updated };
}

/**
 * Jours absents dans la plage min→max des dates fournies (pur, testable).
 * Itération en UTC pour éviter les décalages d'heure d'été.
 */
export function findMissingDates(dates: string[]): string[] {
  if (dates.length === 0) return [];
  const present = new Set(dates);
  const sorted = [...present].sort();
  const from = new Date(`${sorted[0]}T00:00:00Z`).getTime();
  const to = new Date(`${sorted[sorted.length - 1]}T00:00:00Z`).getTime();
  const missing: string[] = [];
  for (let t = from; t <= to; t += 24 * 3600 * 1000) {
    const day = new Date(t).toISOString().slice(0, 10);
    if (!present.has(day)) missing.push(day);
  }
  return missing;
}

/** Toutes les dates distinctes présentes dans gads_daily pour un user. */
export async function getGadsDates(userId: string): Promise<string[]> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("gads_daily") as any)
    .select("date")
    .eq("user_id", userId);
  return [...new Set(((data ?? []) as Array<{ date: string }>).map((r) => r.date))];
}

/** Trous de données Ads : jours sans aucune ligne dans la plage min→max. */
export async function getMissingDates(userId: string): Promise<string[]> {
  return findMissingDates(await getGadsDates(userId));
}

export async function importGadsRows(
  userId: string,
  parsed: GadsCsvParseResult,
  sourceFile: string,
): Promise<GadsImportRecap> {
  const supabase = createAdminClient();
  const { rows } = parsed;

  if (rows.length === 0) {
    return {
      rows_in_csv: 0,
      rows_added: 0,
      rows_updated: 0,
      new_dates: [],
      range: null,
      campaigns_count: 0,
      skipped_totals: parsed.skipped_totals,
      warnings: parsed.warnings,
      missing_dates: await getMissingDates(userId),
    };
  }

  const dates = rows.map((r) => r.date);
  const from = dates.reduce((a, b) => (a < b ? a : b));
  const to = dates.reduce((a, b) => (a > b ? a : b));

  // Existant sur la plage du CSV → distinction ajouts vs écrasements.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing, error: readError } = await (supabase.from("gads_daily") as any)
    .select("campaign_name, date")
    .eq("user_id", userId)
    .gte("date", from)
    .lte("date", to);
  if (readError) throw new Error(`Lecture gads_daily échouée : ${readError.message}`);

  const existingRows = (existing ?? []) as Array<{ campaign_name: string; date: string }>;
  const existingKeys = new Set(existingRows.map(rowKey));
  const existingDates = new Set(existingRows.map((r) => r.date));
  const { added, updated } = classifyRows(rows, existingKeys);

  const importedAt = new Date().toISOString();
  const payload = rows.map((r) => ({
    user_id: userId,
    campaign_name: r.campaign_name,
    date: r.date,
    cost_cents: r.cost_cents,
    clicks: r.clicks,
    impressions: r.impressions,
    conversions: r.conversions,
    conversion_value_cents: r.conversion_value_cents,
    imported_at: importedAt,
    source_file: sourceFile,
  }));

  // UPSERT par lots — le CSV fait foi, onConflict écrase l'existant.
  const CHUNK = 500;
  for (let i = 0; i < payload.length; i += CHUNK) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("gads_daily") as any)
      .upsert(payload.slice(i, i + CHUNK), { onConflict: "user_id,campaign_name,date" });
    if (error) throw new Error(`Upsert gads_daily échoué : ${error.message}`);
  }

  return {
    rows_in_csv: rows.length,
    rows_added: added.length,
    rows_updated: updated.length,
    new_dates: [...new Set(dates)].filter((d) => !existingDates.has(d)).sort(),
    range: { from, to },
    campaigns_count: new Set(rows.map((r) => r.campaign_name)).size,
    skipped_totals: parsed.skipped_totals,
    warnings: parsed.warnings,
    missing_dates: await getMissingDates(userId),
  };
}

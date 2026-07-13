/**
 * Sync campagnes Google Ads → gads_campaigns / gads_campaign_daily /
 * gads_budget_history / gads_campaign_products.
 *
 * Branchée sur la MÊME sync 6 h que gads_daily (api-sync.ts) — pas de 2e cron.
 * Tout est en APPEND / upsert « la source fait foi » : rien n'est jamais effacé
 * de façon destructive, pour devenir l'archive long terme que Google ne garde
 * plus (rétention API 37 mois glissants depuis le 1er juin 2026).
 *
 * Lecture seule côté Google : uniquement des requêtes reporting GAQL.
 */
import { getGoogleAdsConfig, searchGaql, type GoogleAdsConfig, type GaqlCampaignDailyRow } from "./google-ads-client";

// ── Requêtes GAQL (lecture seule) ────────────────────────────────

/**
 * Métadonnées + budget actuel de chaque campagne (snapshot, sans segment date).
 * Renvoie les campagnes non supprimées (ENABLED/PAUSED) ; les campagnes
 * disparues restent en base via last_seen_at (jamais supprimées).
 */
export function buildCampaignsMetaQuery(): string {
  // v23 : les dates de campagne sont exposées via *_date_time (les anciens
  // champs start_date/end_date ne sont plus reconnus). La requête renvoie
  // aussi les campagnes REMOVED (→ « Terminées »).
  return `
    SELECT
      campaign.id, campaign.name, campaign.status,
      campaign.advertising_channel_type,
      campaign.start_date_time, campaign.end_date_time,
      campaign.bidding_strategy_type,
      campaign_budget.amount_micros
    FROM campaign
  `.trim();
}

/** Dépense produit PAR campagne : campaign × item × jour sur [from, to]. */
export function buildCampaignProductQuery(fromIso: string, toIso: string): string {
  return `
    SELECT
      campaign.id,
      segments.product_item_id,
      segments.product_title,
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

// ── Types de lignes API (REST → camelCase) ───────────────────────
interface GaqlCampaignMetaRow {
  campaign?: {
    id?: string | number;
    name?: string;
    status?: string;
    advertisingChannelType?: string;
    startDateTime?: string;
    endDateTime?: string;
    biddingStrategyType?: string;
  };
  campaignBudget?: { amountMicros?: string | number };
}

interface GaqlCampaignProductRow {
  campaign?: { id?: string | number };
  segments?: { date?: string; productItemId?: string; productTitle?: string };
  metrics?: {
    costMicros?: string | number;
    clicks?: string | number;
    impressions?: string | number;
    conversions?: number;
    conversionsValue?: number;
  };
}

// ── Types de lignes de sortie (→ DB) ─────────────────────────────
export interface CampaignMetaRow {
  campaign_id: string;
  name: string;
  status: string;
  channel_type: string | null;
  start_date: string | null;
  end_date: string | null;
  current_budget_cents: number | null;
  bidding_strategy: string | null;
}

export interface CampaignDailyRow {
  campaign_id: string;
  date: string;
  cost_cents: number;
  clicks: number;
  impressions: number;
  conversions: number;
  conversion_value_cents: number;
}

export interface CampaignProductRow {
  campaign_id: string;
  item_id: string;
  product_title: string | null;
  date: string;
  cost_cents: number;
  clicks: number;
  impressions: number;
  conversions: number;
  conversion_value_cents: number;
}

// Un datetime Google « YYYY-MM-DD HH:MM:SS » → date YYYY-MM-DD, ou null.
// L'API renvoie parfois une sentinelle « 2037-12-30 » pour « sans fin planifiée ».
function cleanDate(d: string | undefined): string | null {
  if (!d) return null;
  const day = d.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  if (day === "2037-12-30") return null;
  return day;
}

// ── Mappers purs (testables sans réseau ni DB) ───────────────────

/** Métadonnées campagnes → lignes gads_campaigns (dédupe par id, garde la 1re). */
export function mapCampaignsMeta(results: GaqlCampaignMetaRow[]): CampaignMetaRow[] {
  const byId = new Map<string, CampaignMetaRow>();
  for (const r of results) {
    const id = r.campaign?.id != null ? String(r.campaign.id) : null;
    const name = r.campaign?.name?.trim();
    if (!id || !name) continue;
    if (byId.has(id)) continue;
    const micros = r.campaignBudget?.amountMicros;
    byId.set(id, {
      campaign_id: id,
      name,
      status: r.campaign?.status ?? "UNKNOWN",
      channel_type: r.campaign?.advertisingChannelType ?? null,
      start_date: cleanDate(r.campaign?.startDateTime),
      end_date: cleanDate(r.campaign?.endDateTime),
      current_budget_cents: micros != null ? Math.round(Number(micros) / 10_000) : null,
      bidding_strategy: r.campaign?.biddingStrategyType ?? null,
    });
  }
  return [...byId.values()];
}

/**
 * Réponse campagne×jour (mêmes résultats que la requête gads_daily, qui porte
 * déjà campaign.id) → lignes gads_campaign_daily agrégées par (id, date).
 * Aucun appel API supplémentaire : on réutilise le résultat déjà en main.
 */
export function mapCampaignDailyById(results: GaqlCampaignDailyRow[]): CampaignDailyRow[] {
  const byKey = new Map<string, CampaignDailyRow>();
  for (const r of results) {
    const id = r.campaign?.id != null ? String(r.campaign.id) : null;
    const date = r.segments?.date;
    if (!id || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const m = r.metrics ?? {};
    const key = `${id}|${date}`;
    const row = byKey.get(key) ?? {
      campaign_id: id, date, cost_cents: 0, clicks: 0, impressions: 0, conversions: 0, conversion_value_cents: 0,
    };
    row.cost_cents += Math.round(Number(m.costMicros ?? 0) / 10_000);
    row.clicks += Math.round(Number(m.clicks ?? 0));
    row.impressions += Math.round(Number(m.impressions ?? 0));
    row.conversions = Math.round((row.conversions + Number(m.conversions ?? 0)) * 100) / 100;
    row.conversion_value_cents += Math.round(Number(m.conversionsValue ?? 0) * 100);
    byKey.set(key, row);
  }
  return [...byKey.values()];
}

/** Réponse shopping_performance_view segmentée campagne → gads_campaign_products. */
export function mapCampaignProducts(results: GaqlCampaignProductRow[]): { rows: CampaignProductRow[]; warnings: string[] } {
  const warnings: string[] = [];
  const byKey = new Map<string, CampaignProductRow>();
  for (const r of results) {
    const id = r.campaign?.id != null ? String(r.campaign.id) : null;
    const itemId = r.segments?.productItemId?.trim();
    const date = r.segments?.date;
    if (!id || !itemId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      warnings.push("Ligne produit campagne ignorée : campagne, item_id ou date manquant");
      continue;
    }
    const m = r.metrics ?? {};
    const key = `${id}|${itemId}|${date}`;
    const row = byKey.get(key) ?? {
      campaign_id: id, item_id: itemId, product_title: r.segments?.productTitle?.trim() || null, date,
      cost_cents: 0, clicks: 0, impressions: 0, conversions: 0, conversion_value_cents: 0,
    };
    row.cost_cents += Math.round(Number(m.costMicros ?? 0) / 10_000);
    row.clicks += Math.round(Number(m.clicks ?? 0));
    row.impressions += Math.round(Number(m.impressions ?? 0));
    row.conversions = Math.round((row.conversions + Number(m.conversions ?? 0)) * 100) / 100;
    row.conversion_value_cents += Math.round(Number(m.conversionsValue ?? 0) * 100);
    byKey.set(key, row);
  }
  return { rows: [...byKey.values()], warnings };
}

/**
 * Détermine quelles campagnes doivent recevoir une ligne d'archive de budget :
 * uniquement celles dont le budget a CHANGÉ depuis la dernière observation
 * (ou jamais observées). Pur — la comparaison se fait contre le dernier budget
 * connu passé en argument. Évite d'empiler une ligne identique à chaque sync.
 */
export function budgetChangesToArchive(
  metas: CampaignMetaRow[],
  lastBudgetByCampaign: Map<string, number>,
): Array<{ campaign_id: string; budget_cents: number }> {
  const out: Array<{ campaign_id: string; budget_cents: number }> = [];
  for (const m of metas) {
    if (m.current_budget_cents == null) continue;
    const last = lastBudgetByCampaign.get(m.campaign_id);
    if (last === m.current_budget_cents) continue; // inchangé → rien à archiver
    out.push({ campaign_id: m.campaign_id, budget_cents: m.current_budget_cents });
  }
  return out;
}

// ── Récap de sync campagnes ──────────────────────────────────────
export interface CampaignSyncRecap {
  campaigns_upserted: number;
  campaign_daily_rows: number;
  budget_changes: number;
  campaign_product_rows: number;
  warnings: string[];
}

/**
 * Synchronise le grain campagne pour un user, en réutilisant :
 *  - `campaignDailyResults` : résultats de la requête campagne×jour déjà pullée
 *    par api-sync (évite un appel réseau) → gads_campaign_daily.
 * et en pullant en plus (2 appels) : métadonnées+budget et produits×campagne.
 * Jamais bloquant pour le grain campagne principal : chaque étape catch et
 * pousse un warning plutôt que de faire échouer toute la sync.
 */
export async function syncCampaigns(
  userId: string,
  integrationId: string,
  fromIso: string,
  toIso: string,
  campaignDailyResults: GaqlCampaignDailyRow[],
  cfg?: GoogleAdsConfig,
): Promise<CampaignSyncRecap> {
  const config = cfg ?? getGoogleAdsConfig();
  const recap: CampaignSyncRecap = {
    campaigns_upserted: 0, campaign_daily_rows: 0, budget_changes: 0, campaign_product_rows: 0, warnings: [],
  };
  if (!config) {
    recap.warnings.push("Sync campagnes ignorée : config Google Ads absente.");
    return recap;
  }

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  // 1. gads_campaign_daily (réutilise les résultats déjà en main).
  try {
    const dailyRows = mapCampaignDailyById(campaignDailyResults);
    recap.campaign_daily_rows = await upsertCampaignDaily(supabase, userId, integrationId, dailyRows);
  } catch (e) {
    recap.warnings.push(`gads_campaign_daily non actualisée : ${(e as Error).message.slice(0, 200)}`);
  }

  // 2. Métadonnées + budget + archive budget (append si changé).
  try {
    const metaResults = await searchGaql<GaqlCampaignMetaRow>(config, buildCampaignsMetaQuery());
    const metas = mapCampaignsMeta(metaResults);
    recap.campaigns_upserted = await upsertCampaigns(supabase, userId, integrationId, metas);

    const lastBudgets = await loadLastBudgets(supabase, userId, integrationId);
    const changes = budgetChangesToArchive(metas, lastBudgets);
    recap.budget_changes = await appendBudgetHistory(supabase, userId, integrationId, changes);
  } catch (e) {
    recap.warnings.push(`Métadonnées / budget campagnes non actualisés : ${(e as Error).message.slice(0, 200)}`);
  }

  // 3. Produits × campagne (shopping_performance_view segmentée campagne).
  try {
    const prodResults = await searchGaql<GaqlCampaignProductRow>(config, buildCampaignProductQuery(fromIso, toIso));
    const { rows, warnings } = mapCampaignProducts(prodResults);
    recap.campaign_product_rows = await upsertCampaignProducts(supabase, userId, integrationId, rows);
    if (warnings.length > 0) recap.warnings.push(`${warnings.length} lignes produit×campagne ignorées.`);
  } catch (e) {
    recap.warnings.push(`Produits par campagne non actualisés : ${(e as Error).message.slice(0, 200)}`);
  }

  return recap;
}

// ── Upserts / archive DB ─────────────────────────────────────────
const CHUNK = 500;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertCampaigns(supabase: any, userId: string, integrationId: string, metas: CampaignMetaRow[]): Promise<number> {
  if (metas.length === 0) return 0;
  const now = new Date().toISOString();
  const payload = metas.map((m) => ({ user_id: userId, integration_id: integrationId, ...m, last_seen_at: now }));
  for (let i = 0; i < payload.length; i += CHUNK) {
    const { error } = await supabase.from("gads_campaigns")
      .upsert(payload.slice(i, i + CHUNK), { onConflict: "user_id,integration_id,campaign_id" });
    if (error) throw new Error(`Upsert gads_campaigns échoué : ${error.message}`);
  }
  return payload.length;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertCampaignDaily(supabase: any, userId: string, integrationId: string, rows: CampaignDailyRow[]): Promise<number> {
  if (rows.length === 0) return 0;
  const importedAt = new Date().toISOString();
  const payload = rows.map((r) => ({ user_id: userId, integration_id: integrationId, ...r, imported_at: importedAt }));
  for (let i = 0; i < payload.length; i += CHUNK) {
    const { error } = await supabase.from("gads_campaign_daily")
      .upsert(payload.slice(i, i + CHUNK), { onConflict: "user_id,integration_id,campaign_id,date" });
    if (error) throw new Error(`Upsert gads_campaign_daily échoué : ${error.message}`);
  }
  return payload.length;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertCampaignProducts(supabase: any, userId: string, integrationId: string, rows: CampaignProductRow[]): Promise<number> {
  if (rows.length === 0) return 0;
  const importedAt = new Date().toISOString();
  const payload = rows.map((r) => ({ user_id: userId, integration_id: integrationId, ...r, status_in_feed: "active", imported_at: importedAt }));
  for (let i = 0; i < payload.length; i += CHUNK) {
    const { error } = await supabase.from("gads_campaign_products")
      .upsert(payload.slice(i, i + CHUNK), { onConflict: "user_id,integration_id,campaign_id,item_id,date" });
    if (error) throw new Error(`Upsert gads_campaign_products échoué : ${error.message}`);
  }
  return payload.length;
}

/** Dernier budget archivé par campagne (BOUTIQUE) pour ne rejouer que les changements. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadLastBudgets(supabase: any, userId: string, integrationId: string): Promise<Map<string, number>> {
  const { data, error } = await supabase.from("gads_budget_history")
    .select("campaign_id, budget_cents, observed_at")
    .eq("user_id", userId)
    .eq("integration_id", integrationId)
    .order("observed_at", { ascending: false });
  if (error) throw new Error(`Lecture gads_budget_history échouée : ${error.message}`);
  const map = new Map<string, number>();
  for (const r of (data ?? []) as Array<{ campaign_id: string; budget_cents: number }>) {
    if (!map.has(r.campaign_id)) map.set(r.campaign_id, Number(r.budget_cents));
  }
  return map;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function appendBudgetHistory(supabase: any, userId: string, integrationId: string, changes: Array<{ campaign_id: string; budget_cents: number }>): Promise<number> {
  if (changes.length === 0) return 0;
  const observedAt = new Date().toISOString();
  const payload = changes.map((c) => ({ user_id: userId, integration_id: integrationId, ...c, observed_at: observedAt }));
  const { error } = await supabase.from("gads_budget_history").insert(payload);
  if (error) throw new Error(`Archive gads_budget_history échouée : ${error.message}`);
  return payload.length;
}

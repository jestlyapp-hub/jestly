/**
 * Collecte du pixel first-party — validation, filtre bots, écriture session.
 *
 * Règle first/last touch (schéma validé) :
 *  - première arrivée d'une session → colonnes plates = FIRST touch, figées ;
 *  - arrivée suivante porteuse de signaux → last_touch (jsonb) remplacé ;
 *  - toute arrivée → last_seen_at rafraîchi.
 */
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

const short = z.string().trim().max(500);
const long = z.string().trim().max(2000);

export const PixelPayloadSchema = z.object({
  pixel_id: z.string().uuid(),
  session_id: z.string().min(8).max(64).regex(/^[A-Za-z0-9-]+$/),
  shop: short.optional().nullable(),
  landing: long.optional().nullable(),
  referrer: long.optional().nullable(),
  ts: z.number().optional(),
  params: z.object({
    gclid: short.optional(),
    gbraid: short.optional(),
    wbraid: short.optional(),
    utm_source: short.optional(),
    utm_medium: short.optional(),
    utm_campaign: short.optional(),
    utm_content: short.optional(),
    utm_term: short.optional(),
  }).optional(),
});

export type PixelPayload = z.infer<typeof PixelPayloadSchema>;

/** Bots évidents — on ignore silencieusement (pas de 4xx qui les ferait insister). */
export function isLikelyBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  return /bot|crawl|spider|slurp|headless|phantom|selenium|python-requests|curl\/|wget/i.test(userAgent);
}

/** L'arrivée porte-t-elle des signaux d'attribution (utm/gclid/referrer) ? */
export function hasAttributionSignals(payload: PixelPayload): boolean {
  const p = payload.params ?? {};
  return Boolean(
    p.gclid || p.gbraid || p.wbraid ||
    p.utm_source || p.utm_medium || p.utm_campaign || p.utm_content || p.utm_term ||
    payload.referrer,
  );
}

// Cache court des pixel_id valides — évite un SELECT par page vue.
const shopCache = new Map<string, { shopId: string | null; expires: number }>();
const SHOP_CACHE_MS = 60_000;

async function resolveActiveShop(pixelId: string): Promise<string | null> {
  const cached = shopCache.get(pixelId);
  if (cached && cached.expires > Date.now()) return cached.shopId;

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("pixel_shops") as any)
    .select("id")
    .eq("id", pixelId)
    .eq("is_active", true)
    .maybeSingle();
  const shopId = data?.id ?? null;
  shopCache.set(pixelId, { shopId, expires: Date.now() + SHOP_CACHE_MS });
  return shopId;
}

/**
 * Enregistre une arrivée. Renvoie false si le pixel_id est inconnu/inactif
 * (l'appelant répond 204 quand même — pas d'oracle pour les curieux).
 */
export async function recordArrival(payload: PixelPayload): Promise<boolean> {
  const shopId = await resolveActiveShop(payload.pixel_id);
  if (!shopId) return false;

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const p = payload.params ?? {};
  const signals = hasAttributionSignals(payload);
  const touch = {
    gclid: p.gclid ?? null,
    gbraid: p.gbraid ?? null,
    wbraid: p.wbraid ?? null,
    utm_source: p.utm_source ?? null,
    utm_medium: p.utm_medium ?? null,
    utm_campaign: p.utm_campaign ?? null,
    utm_content: p.utm_content ?? null,
    utm_term: p.utm_term ?? null,
    referrer: payload.referrer ?? null,
    landing_page: payload.landing ?? null,
    at: now,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = supabase.from("pixel_sessions") as any;
  const { data: existing } = await table
    .select("id")
    .eq("shop_id", shopId)
    .eq("session_id", payload.session_id)
    .maybeSingle();

  if (!existing) {
    const { error } = await table.insert({
      shop_id: shopId,
      session_id: payload.session_id,
      gclid: touch.gclid,
      gbraid: touch.gbraid,
      wbraid: touch.wbraid,
      utm_source: touch.utm_source,
      utm_medium: touch.utm_medium,
      utm_campaign: touch.utm_campaign,
      utm_content: touch.utm_content,
      utm_term: touch.utm_term,
      referrer: touch.referrer,
      landing_page: touch.landing_page,
      first_seen_at: now,
      last_seen_at: now,
    });
    // Course entre deux onglets : l'unique (shop_id, session_id) a gagné → update.
    if (!error) return true;
    if (error.code !== "23505") {
      logger.error("pixel_session_insert_failed", { code: error.code });
      return false;
    }
  }

  const update: Record<string, unknown> = { last_seen_at: now };
  if (signals) update.last_touch = touch;
  const { error: updateError } = await table
    .update(update)
    .eq("shop_id", shopId)
    .eq("session_id", payload.session_id);
  if (updateError) {
    logger.error("pixel_session_update_failed", { code: updateError.code });
    return false;
  }
  return true;
}

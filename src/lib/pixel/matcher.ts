/**
 * Matching commande Shopify → session pixel first-party.
 *
 * Deux mécanismes, dans l'ordre de fiabilité :
 *  1. `cart_attribute` (confiance 0,95) : le script pixel pousse le
 *     session_id en attribut de panier `_jestly_sid`, qui revient dans la
 *     commande (customAttributes). Rattachement direct et sûr.
 *  2. `time_proximity` (confiance 0,35, repli) : commande sans attribut ET
 *     non trackée côté Shopify → on cherche LA session porteuse de signaux
 *     dans les 24 h précédentes. Appliqué seulement si le candidat est
 *     unique et si l'utilisateur n'a qu'une boutique pixel (sinon trop
 *     ambigu — on préfère laisser ghost que d'inventer).
 *
 * Écrit UNIQUEMENT dans pixel_order_attribution : le tracking_status natif
 * de shopify_orders reste la référence de vérité, jamais modifié.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { normalizeSource } from "@/lib/ads/utm-parser";

export type PixelResolvedSource = "google_ads" | "seo" | "pinterest" | "direct" | "other";

export const JESTLY_SID_ATTRIBUTE = "_jestly_sid";

// ── Fonctions pures (testables) ──────────────────────────────────

/**
 * Extrait le session_id des attributs de commande.
 * GraphQL renvoie [{key, value}], le REST des webhooks [{name, value}].
 */
export function extractJestlySid(
  attributes: Array<{ key?: string; name?: string; value?: string | null }> | null | undefined,
): string | null {
  for (const attr of attributes ?? []) {
    const key = attr.key ?? attr.name;
    if (key === JESTLY_SID_ATTRIBUTE && attr.value && /^[A-Za-z0-9-]{8,64}$/.test(attr.value)) {
      return attr.value;
    }
  }
  return null;
}

export interface SessionTouch {
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  referrer?: string | null;
}

export interface PixelSessionLike extends SessionTouch {
  last_touch?: SessionTouch | null;
}

/**
 * Source résolue d'une session — LAST touch s'il existe (le plus proche de
 * l'achat), sinon le first touch. Même hiérarchie que channels.ts :
 * gclid → google_ads ; utm de campagne → provider ; referrer moteur → seo ;
 * aucun signal → direct.
 */
export function resolveSessionSource(session: PixelSessionLike): PixelResolvedSource {
  const touch: SessionTouch = session.last_touch ?? session;
  if (touch.gclid || touch.gbraid || touch.wbraid) return "google_ads";

  const provider = normalizeSource(touch.utm_source);
  if (provider === "google_ads") return "google_ads";
  if (provider === "pinterest") return "pinterest";
  if (provider) return "other";
  if (touch.utm_source || touch.utm_medium || touch.utm_campaign) return "other";

  const referrer = (touch.referrer ?? "").toLowerCase();
  if (/(google\.|bing\.|duckduckgo\.|qwant\.|ecosia\.|yahoo\.)/.test(referrer)) return "seo";
  if (referrer.includes("pinterest")) return "pinterest";
  if (referrer) return "other";
  return "direct";
}

// ── Orchestration DB ─────────────────────────────────────────────

export interface PixelMatchResult {
  cart_attribute: number;
  time_proximity: number;
  scanned: number;
}

interface OrderRow {
  id: string;
  shopify_order_id: string;
  created_at: string;
  tracking_status: string | null;
  note_attributes: Array<{ key?: string; name?: string; value?: string | null }> | null;
}

interface SessionRow extends PixelSessionLike {
  shop_id: string;
  session_id: string;
  first_seen_at: string;
  last_seen_at: string;
}

/**
 * Matche les commandes d'un utilisateur vers les sessions pixel.
 * Idempotent : les commandes déjà résolues sont ignorées (UNIQUE shop/commande).
 */
export async function matchPixelAttributionForUser(userId: string): Promise<PixelMatchResult> {
  const supabase = createAdminClient();
  const result: PixelMatchResult = { cart_attribute: 0, time_proximity: 0, scanned: 0 };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: shops } = await (supabase.from("pixel_shops") as any)
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true);
  const shopIds = ((shops ?? []) as Array<{ id: string }>).map((s) => s.id);
  if (shopIds.length === 0) return result;

  // Multi-boutiques : matcher sur les commandes de TOUTES les boutiques actives
  // du user (le sid pixel est global). Ne casse pas avec 2 boutiques.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integs } = await (supabase.from("integrations") as any)
    .select("id")
    .eq("user_id", userId)
    .eq("provider", "shopify")
    .eq("status", "active");
  const integrationIds = ((integs ?? []) as Array<{ id: string }>).map((i) => i.id);
  if (integrationIds.length === 0) return result;

  // Commandes des 90 derniers jours pas encore résolues par le pixel.
  const since = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orderRows } = await (supabase.from("shopify_orders") as any)
    .select("id, shopify_order_id, created_at, tracking_status, note_attributes")
    .in("integration_id", integrationIds)
    .is("cancelled_at", null)
    .gte("created_at", since);
  const orders = (orderRows ?? []) as OrderRow[];
  if (orders.length === 0) return result;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: resolved } = await (supabase.from("pixel_order_attribution") as any)
    .select("shopify_order_id")
    .in("shop_id", shopIds);
  const alreadyResolved = new Set(
    ((resolved ?? []) as Array<{ shopify_order_id: string }>).map((r) => r.shopify_order_id),
  );

  const pending = orders.filter((o) => !alreadyResolved.has(o.shopify_order_id));
  result.scanned = pending.length;
  if (pending.length === 0) return result;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attributionTable = supabase.from("pixel_order_attribution") as any;

  // ── Passe 1 : cart attribute (fiable) ──────────────────────────
  const proximityCandidates: OrderRow[] = [];
  for (const order of pending) {
    const sid = extractJestlySid(order.note_attributes);
    if (!sid) {
      proximityCandidates.push(order);
      continue;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: session } = await (supabase.from("pixel_sessions") as any)
      .select("shop_id, session_id, gclid, gbraid, wbraid, utm_source, utm_medium, utm_campaign, referrer, last_touch, first_seen_at, last_seen_at")
      .in("shop_id", shopIds)
      .eq("session_id", sid)
      .maybeSingle();
    if (!session) {
      // Attribut présent mais session inconnue (purge, autre environnement) :
      // pas de session = pas de source, on laisse la commande telle quelle.
      continue;
    }
    const s = session as SessionRow;
    const { error } = await attributionTable.upsert({
      shop_id: s.shop_id,
      shopify_order_id: order.shopify_order_id,
      order_id: order.id,
      session_id: s.session_id,
      resolved_source: resolveSessionSource(s),
      match_method: "cart_attribute",
      confidence: 0.95,
      matched_at: new Date().toISOString(),
    }, { onConflict: "shop_id,shopify_order_id" });
    if (error) logger.error("pixel_match_upsert_failed", { code: error.code });
    else result.cart_attribute += 1;
  }

  // ── Passe 2 : proximité temporelle (repli prudent) ─────────────
  // Uniquement mono-boutique (sinon impossible de savoir quel shop matcher)
  // et uniquement pour les commandes que Shopify n'a pas trackées.
  if (shopIds.length !== 1) return result;
  const shopId = shopIds[0];

  for (const order of proximityCandidates) {
    if (order.tracking_status === "tracked") continue;
    const orderAt = new Date(order.created_at).getTime();
    const windowStart = new Date(orderAt - 24 * 3600 * 1000).toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: candidates } = await (supabase.from("pixel_sessions") as any)
      .select("shop_id, session_id, gclid, gbraid, wbraid, utm_source, utm_medium, utm_campaign, referrer, last_touch, first_seen_at, last_seen_at")
      .eq("shop_id", shopId)
      .gte("last_seen_at", windowStart)
      .lte("last_seen_at", order.created_at);
    const withSignals = ((candidates ?? []) as SessionRow[])
      .filter((s) => resolveSessionSource(s) !== "direct");
    // Candidat unique exigé : à deux visiteurs possibles, on n'invente pas.
    if (withSignals.length !== 1) continue;
    const s = withSignals[0];
    const { error } = await attributionTable.upsert({
      shop_id: s.shop_id,
      shopify_order_id: order.shopify_order_id,
      order_id: order.id,
      session_id: s.session_id,
      resolved_source: resolveSessionSource(s),
      match_method: "time_proximity",
      confidence: 0.35,
      matched_at: new Date().toISOString(),
    }, { onConflict: "shop_id,shopify_order_id" });
    if (error) logger.error("pixel_match_upsert_failed", { code: error.code });
    else result.time_proximity += 1;
  }

  return result;
}

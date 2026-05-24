/**
 * Shopify Admin GraphQL helper — multi-tenant.
 *
 * Auth = client_credentials grant (Dev Dashboard app). Pas de token shpat_ permanent :
 * mint d'un token 24h à la demande, cache mémoire (clé = shop_domain), refresh auto.
 *
 * Server-side uniquement. Les credentials viennent TOUJOURS d'un ShopOverride
 * (l'intégration de l'user courant) — aucune dépendance aux env vars.
 *
 * Voir SHOPIFY_ECOM_INTEGRATION.md §3.
 */

import { logger } from "@/lib/logger";

// ── Errors typés ─────────────────────────────────────────────────
export class ShopifyAuthError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ShopifyAuthError";
  }
}

export class ShopifyRateLimitError extends Error {
  constructor(message: string, public retryAfterMs?: number) {
    super(message);
    this.name = "ShopifyRateLimitError";
  }
}

export class ShopifyGraphQLError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string, public userErrors?: any[]) {
    super(message);
    this.name = "ShopifyGraphQLError";
  }
}

// ── Config ───────────────────────────────────────────────────────
const DEFAULT_API_VERSION = "2025-01";
const TOKEN_SAFETY_MARGIN_S = 300; // mint au moins 5 min avant expiration
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 500;
const COST_THROTTLE_THRESHOLD = 0.9;
const COST_THROTTLE_DELAY_MS = 1000;

export interface ShopOverride {
  shopDomain: string;
  clientId: string;
  clientSecret: string;
  apiVersion?: string;
}

interface CachedToken { token: string; exp: number }

// Cache par shop_domain (multi-tenant ready, V1 = un seul shop)
const tokenCache = new Map<string, CachedToken>();
const tokenMintInflight = new Map<string, Promise<string>>();

function requireShop(shop?: ShopOverride): Required<ShopOverride> {
  if (!shop || !shop.shopDomain || !shop.clientId || !shop.clientSecret) {
    throw new ShopifyAuthError(
      "Shopify credentials manquants : passe un ShopOverride (intégration de l'user). Multi-tenant, aucun fallback env.",
    );
  }
  return { ...shop, apiVersion: shop.apiVersion ?? DEFAULT_API_VERSION };
}

/**
 * Récupère un access token valide pour le shop.
 * Cache module-level avec marge de sécurité 5 min.
 * Mutex inflight pour éviter 2 mints parallèles quand le cache est froid.
 */
export async function getShopifyToken(shop?: ShopOverride): Promise<string> {
  const cfg = requireShop(shop);
  const key = cfg.shopDomain;

  // Hit cache ?
  const cached = tokenCache.get(key);
  if (cached && Date.now() < cached.exp) return cached.token;

  // Mint déjà en cours ? Attendre la promesse partagée.
  const inflight = tokenMintInflight.get(key);
  if (inflight) return inflight;

  // Sinon, mint
  const promise = mintToken(cfg).finally(() => {
    tokenMintInflight.delete(key);
  });
  tokenMintInflight.set(key, promise);
  return promise;
}

async function mintToken(cfg: ShopOverride): Promise<string> {
  logger.info("shopify_token_mint_start", { shop: cfg.shopDomain });
  const res = await fetch(`https://${cfg.shopDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logger.error("shopify_token_mint_failed", { shop: cfg.shopDomain, status: res.status, body: body.slice(0, 200) });
    if (res.status === 401 || res.status === 403) {
      throw new ShopifyAuthError(`Token grant unauthorized (${res.status})`, res.status);
    }
    throw new ShopifyAuthError(`Token grant failed: ${res.status} ${body.slice(0, 120)}`, res.status);
  }

  const j = (await res.json()) as { access_token: string; expires_in: number; scope?: string };
  const ttl = (j.expires_in - TOKEN_SAFETY_MARGIN_S) * 1000;
  const cached: CachedToken = { token: j.access_token, exp: Date.now() + ttl };
  tokenCache.set(cfg.shopDomain, cached);
  logger.info("shopify_token_minted", { shop: cfg.shopDomain, expires_in_s: j.expires_in, scope: j.scope });
  return j.access_token;
}

/**
 * Vide le cache (utile pour rotation de secret ou tests).
 */
export function clearShopifyTokenCache(shopDomain?: string): void {
  if (shopDomain) {
    tokenCache.delete(shopDomain);
    tokenMintInflight.delete(shopDomain);
  } else {
    tokenCache.clear();
    tokenMintInflight.clear();
  }
}

// ── Cost-based throttling ────────────────────────────────────────
const lastCallCost = new Map<string, { available: number; max: number; restoreRate: number; ts: number }>();

function shouldThrottle(shopDomain: string): boolean {
  const c = lastCallCost.get(shopDomain);
  if (!c || c.max === 0) return false;
  // Restitue selon le temps écoulé
  const elapsedS = (Date.now() - c.ts) / 1000;
  const restored = Math.min(c.max, c.available + c.restoreRate * elapsedS);
  return restored < c.max * (1 - COST_THROTTLE_THRESHOLD);
}

function parseCostHeader(headerVal: string | null): { available: number; max: number; restoreRate: number } | null {
  if (!headerVal) return null;
  // Format Shopify : "currentlyAvailable/maxAvailable" (REST) ou JSON cost (GraphQL via extensions)
  const m = headerVal.match(/(\d+)\/(\d+)/);
  if (!m) return null;
  return { available: parseInt(m[1], 10), max: parseInt(m[2], 10), restoreRate: 50 };
}

// ── shopifyAdmin (le point d'entrée principal) ───────────────────
/**
 * Exécute une query GraphQL Admin API avec retry, mutex token, et rate limit.
 * Server-side uniquement.
 */
export async function shopifyAdmin<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  shop?: ShopOverride,
): Promise<T> {
  const cfg = requireShop(shop);

  // Throttle si bucket presque vide
  if (shouldThrottle(cfg.shopDomain)) {
    await sleep(COST_THROTTLE_DELAY_MS);
  }

  let lastErr: unknown = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const token = await getShopifyToken(cfg);
      const res = await fetch(
        `https://${cfg.shopDomain}/admin/api/${cfg.apiVersion}/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": token,
          },
          body: JSON.stringify({ query, variables }),
        },
      );

      // Update cost tracker
      const cost = parseCostHeader(res.headers.get("X-Shopify-Shop-Api-Call-Limit"));
      if (cost) {
        lastCallCost.set(cfg.shopDomain, { ...cost, ts: Date.now() });
      }

      if (res.status === 401) {
        // Token rejeté → vider cache et retry une fois
        clearShopifyTokenCache(cfg.shopDomain);
        if (attempt === 0) continue;
        throw new ShopifyAuthError("401 Unauthorized after token refresh", 401);
      }

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get("Retry-After") ?? "1", 10) * 1000;
        const delay = Math.max(retryAfter, BASE_RETRY_DELAY_MS * Math.pow(2, attempt));
        logger.warn("shopify_rate_limited", { shop: cfg.shopDomain, attempt, retry_after_ms: delay });
        if (attempt < MAX_RETRIES - 1) {
          await sleep(delay);
          continue;
        }
        throw new ShopifyRateLimitError("Rate limit exceeded after retries", delay);
      }

      if (res.status >= 500 && res.status < 600) {
        const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
        logger.warn("shopify_server_error", { shop: cfg.shopDomain, status: res.status, attempt });
        if (attempt < MAX_RETRIES - 1) {
          await sleep(delay);
          continue;
        }
        throw new Error(`Shopify server error ${res.status} after retries`);
      }

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Shopify HTTP ${res.status}: ${body.slice(0, 200)}`);
      }

      const json = (await res.json()) as { data?: T; errors?: unknown };
      if (json.errors) {
        logger.error("shopify_graphql_errors", { shop: cfg.shopDomain, errors: json.errors });
        throw new ShopifyGraphQLError(
          `GraphQL errors: ${JSON.stringify(json.errors).slice(0, 200)}`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          json.errors as any[],
        );
      }
      return json.data as T;
    } catch (err) {
      lastErr = err;
      // Erreurs typed déjà gérées au-dessus (auth/rate/server) — les autres bubble up
      if (err instanceof ShopifyAuthError || err instanceof ShopifyGraphQLError) throw err;
      // Erreur réseau → retry
      if (attempt < MAX_RETRIES - 1) {
        const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }
    }
  }
  throw lastErr ?? new Error("shopifyAdmin failed after retries");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

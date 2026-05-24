/**
 * Shopify Admin GraphQL client (V1 single-tenant Lhorlogemurale).
 *
 * Wrapper léger autour du helper `shopifyAdmin` qui gère :
 *   - mint+cache token client_credentials (24h)
 *   - retry exponential backoff sur 429/5xx
 *   - cost-based throttling
 *   - typed errors (Auth/RateLimit/GraphQL)
 *
 * Garde la classe ShopifyClient et createShopifyClient pour backward-compat
 * avec le code écrit en phase 2 (sync.ts, etc.). En interne tout passe par
 * `shopifyAdmin` qui ignore le token statique passé à l'init.
 */

import { shopifyAdmin, type ShopOverride, ShopifyAuthError, ShopifyGraphQLError, ShopifyRateLimitError } from "./admin";

export { ShopifyAuthError, ShopifyGraphQLError, ShopifyRateLimitError };

/** Erreur générique API Shopify — gardée pour compat. */
export class ShopifyApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ShopifyApiError";
  }
}

/** Minimal "decrypted integration" shape — kept for sync.ts API compat. */
export interface DecryptedIntegrationLike {
  id: string;
  user_id: string;
  shop_domain: string;
  /** ignoré : V1 utilise le helper client_credentials, pas un token statique. */
  access_token?: string;
  webhook_secret?: string | null;
  scopes?: string[];
  /** Si fourni, override les env vars (multi-tenant V2). */
  shop_override?: ShopOverride;
}

export interface ShopifyClientOptions {
  apiVersion?: string;
}

/**
 * Client thin-wrapper.
 * En V1 single-tenant, le shop est résolu depuis les env vars SHOPIFY_LHORLOGEMURALE_*.
 * Le paramètre `integration` est gardé pour API compat mais seuls `shop_domain` + `shop_override`
 * (V2) sont consultés.
 */
export class ShopifyClient {
  private override?: ShopOverride;
  public readonly domain: string;

  constructor(integration: DecryptedIntegrationLike, _opts: ShopifyClientOptions = {}) {
    this.domain = integration.shop_domain;
    this.override = integration.shop_override;
  }

  async request<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T> {
    try {
      return await shopifyAdmin<T>(query, variables, this.override);
    } catch (err) {
      if (err instanceof ShopifyAuthError || err instanceof ShopifyGraphQLError || err instanceof ShopifyRateLimitError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new ShopifyApiError(message);
    }
  }
}

export function createShopifyClient(integration: DecryptedIntegrationLike): ShopifyClient {
  return new ShopifyClient(integration);
}

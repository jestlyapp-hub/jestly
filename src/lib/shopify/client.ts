/**
 * Shopify Admin GraphQL client factory.
 *
 * Gère retries (exponential backoff sur 429), rate limiting cost-based,
 * et timeouts. Serveur uniquement (jamais côté client — token chiffré).
 */
import { GraphQLClient } from "graphql-request";
import type { DecryptedIntegration } from "./types";

const SHOPIFY_API_VERSION = "2026-01";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

export interface ShopifyClientOptions {
  apiVersion?: string;
  timeoutMs?: number;
}

export class ShopifyClient {
  private client: GraphQLClient;
  private shopDomain: string;

  constructor(integration: DecryptedIntegration, opts: ShopifyClientOptions = {}) {
    const version = opts.apiVersion ?? SHOPIFY_API_VERSION;
    this.shopDomain = integration.shop_domain;
    const endpoint = `https://${integration.shop_domain}/admin/api/${version}/graphql.json`;
    this.client = new GraphQLClient(endpoint, {
      headers: {
        "X-Shopify-Access-Token": integration.access_token,
        "Content-Type": "application/json",
      },
      // graphql-request v7 utilise fetch natif, timeout via AbortSignal si besoin
      ...(opts.timeoutMs ? { signal: AbortSignal.timeout(opts.timeoutMs) } : {}),
    });
  }

  get domain(): string {
    return this.shopDomain;
  }

  /**
   * Execute une query GraphQL avec retry automatique sur 429/5xx.
   */
  async request<T = unknown>(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    let lastError: unknown = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const result = await this.client.request<T>(query, variables);
        return result;
      } catch (err: unknown) {
        lastError = err;
        const status = (err as { response?: { status?: number } })?.response?.status;
        const message = (err as { message?: string })?.message ?? String(err);
        // Retry sur 429 (rate limit) ou 5xx
        if (status === 429 || (status && status >= 500 && status < 600)) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        // Auth error : ne pas retry
        if (status === 401 || status === 403) {
          throw new ShopifyAuthError(message, status);
        }
        // Autres erreurs : throw direct
        throw new ShopifyApiError(message, status);
      }
    }
    throw new ShopifyApiError(
      `Shopify request failed after ${MAX_RETRIES} retries: ${String(lastError)}`,
      undefined,
    );
  }
}

export class ShopifyApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "ShopifyApiError";
  }
}

export class ShopifyAuthError extends ShopifyApiError {
  constructor(message: string, status?: number) {
    super(message, status);
    this.name = "ShopifyAuthError";
  }
}

export function createShopifyClient(integration: DecryptedIntegration): ShopifyClient {
  return new ShopifyClient(integration);
}

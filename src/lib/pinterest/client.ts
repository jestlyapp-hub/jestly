/**
 * Client Pinterest API v5 (multi-tenant, read-only en V2).
 * Token récupéré via OAuthManager (refresh auto). Pagination cursor (`bookmark`),
 * retries 429/5xx avec backoff exponentiel.
 */
import { oauthManager } from "@/lib/oauth/manager";
import { logger } from "@/lib/logger";

const API_BASE = "https://api.pinterest.com/v5";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

export interface PinterestIntegrationRef {
  id: string;
  external_account_id?: string | null;
}

export class PinterestApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "PinterestApiError";
  }
}

type QueryVal = string | number | string[];

export async function pinterestApi<T = unknown>(
  integration: PinterestIntegrationRef,
  endpoint: string,
  options: { method?: "GET" | "POST" | "PATCH" | "DELETE"; query?: Record<string, QueryVal>; body?: unknown } = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const url = new URL(`${API_BASE}${endpoint}`);
  for (const [k, v] of Object.entries(options.query ?? {})) {
    if (Array.isArray(v)) v.forEach((item) => url.searchParams.append(k, item));
    else url.searchParams.set(k, String(v));
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const token = await oauthManager.getValidAccessToken(integration.id);
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (options.body !== undefined) headers["Content-Type"] = "application/json";

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    if (res.status === 401) {
      // Token rejeté : forcer un refresh puis retry une fois.
      if (attempt === 0) {
        await oauthManager.refresh(integration.id).catch(() => {});
        continue;
      }
      throw new PinterestApiError("401 Unauthorized (token Pinterest invalide après refresh)", 401);
    }

    if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
      const retryAfter = parseInt(res.headers.get("Retry-After") ?? "0", 10) * 1000;
      const delay = Math.max(retryAfter, BASE_DELAY_MS * 2 ** attempt);
      logger.warn("pinterest_retry", { status: res.status, attempt, delay_ms: delay, endpoint });
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw new PinterestApiError(`Pinterest ${res.status} après ${MAX_RETRIES} essais`, res.status);
    }

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new PinterestApiError(`Pinterest HTTP ${res.status}: ${txt.slice(0, 200)}`, res.status);
    }

    return (await res.json()) as T;
  }
  throw new PinterestApiError("Pinterest: échec après retries");
}

/** Itère sur toutes les pages d'un endpoint paginé (cursor `bookmark`). */
export async function* pinterestPaginate<T = unknown>(
  integration: PinterestIntegrationRef,
  endpoint: string,
  query: Record<string, QueryVal> = {},
): AsyncGenerator<T[]> {
  let bookmark: string | undefined;
  do {
    const res = await pinterestApi<{ items: T[]; bookmark?: string }>(integration, endpoint, {
      query: { ...query, ...(bookmark ? { bookmark } : {}) },
    });
    yield res.items ?? [];
    bookmark = res.bookmark;
  } while (bookmark);
}

/** Collecte toutes les pages en un seul tableau. */
export async function pinterestCollectAll<T = unknown>(
  integration: PinterestIntegrationRef,
  endpoint: string,
  query: Record<string, QueryVal> = {},
): Promise<T[]> {
  const out: T[] = [];
  for await (const page of pinterestPaginate<T>(integration, endpoint, query)) out.push(...page);
  return out;
}

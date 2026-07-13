/**
 * Résolution multi-boutiques d'une intégration Shopify.
 *
 * Le module ECOM supportant plusieurs boutiques Shopify pour un même
 * utilisateur (ex. L'Horloge Murale + Mignou), on ne peut plus présumer « une
 * seule intégration active ». Ce helper remplace le pattern `.maybeSingle()`
 * (qui LÈVE une erreur dès qu'il y a 2 lignes actives) par une résolution
 * déterministe :
 *   - `integration_id` demandé (sélecteur de boutique) et appartenant au user →
 *     cette boutique.
 *   - sinon → la boutique PRINCIPALE (la plus ancienne, `created_at` asc).
 *
 * GARDE-FOU MULTI-TENANT : toujours filtré par `user_id`. Fonctionne avec le
 * client RLS (`auth.supabase`) comme avec le client admin (`createAdminClient`) —
 * dans les deux cas le `.eq("user_id", …)` scope les lignes à leur propriétaire.
 */

export interface EcomIntegrationRef {
  id: string;
  shop_domain: string;
  status: string;
  last_sync_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const COLS = "id, shop_domain, status, last_sync_at, metadata, created_at";

/** Toutes les intégrations Shopify ACTIVES du user, principale (plus ancienne) d'abord. */
export async function listShopifyIntegrations(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
): Promise<EcomIntegrationRef[]> {
  const { data } = await supabase
    .from("integrations")
    .select(COLS)
    .eq("user_id", userId)
    .eq("provider", "shopify")
    .eq("status", "active")
    .order("created_at", { ascending: true });
  return (data ?? []) as EcomIntegrationRef[];
}

export interface ResolvedEcomIntegration {
  /** Boutique retenue (demandée si valide, sinon principale). */
  integration: EcomIntegrationRef;
  /** Toutes les boutiques actives du user (principale d'abord). */
  all: EcomIntegrationRef[];
  /** true si la boutique retenue est la principale (la plus ancienne). */
  isPrimary: boolean;
}

/**
 * Résout la boutique ciblée par une requête ECOM. Renvoie null si l'utilisateur
 * n'a aucune intégration Shopify active.
 */
export async function resolveShopifyIntegration(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  requestedId?: string | null,
): Promise<ResolvedEcomIntegration | null> {
  const all = await listShopifyIntegrations(supabase, userId);
  if (all.length === 0) return null;
  const requested = requestedId ? all.find((i) => i.id === requestedId) : undefined;
  const integration = requested ?? all[0];
  return { integration, all, isPrimary: integration.id === all[0].id };
}

/**
 * Résout uniquement l'id de la boutique ciblée (demandée si valide, sinon
 * principale). Pratique pour les libs qui n'ont besoin que du scope.
 */
export async function resolveShopifyIntegrationId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  requestedId?: string | null,
): Promise<string | null> {
  const resolved = await resolveShopifyIntegration(supabase, userId, requestedId);
  return resolved?.integration.id ?? null;
}

/** Lit l'`integration_id` demandé par une requête (sélecteur de boutique). */
export function requestedIntegrationId(reqOrUrl: Request | URL | string): string | null {
  const url =
    reqOrUrl instanceof URL
      ? reqOrUrl
      : typeof reqOrUrl === "string"
        ? new URL(reqOrUrl)
        : new URL(reqOrUrl.url);
  const raw = url.searchParams.get("integration_id");
  return raw && raw.trim() ? raw.trim() : null;
}

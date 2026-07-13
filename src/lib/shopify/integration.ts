/**
 * Helpers serveur pour charger/décrypter une intégration Shopify.
 * NE JAMAIS appeler côté client.
 *
 * V1 finale (post-pgsodium) : la table `integrations` stocke `secret_encrypted text`
 * (base64 AES-256-GCM). Pour Shopify, on chiffre le `client_secret` ; le token 24h
 * est mint à la demande via lib/shopify/lhorlogemurale.ts.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptFromString } from "@/lib/encryption";
import type { DecryptedIntegration } from "./types";

export interface IntegrationRowV2 {
  id: string;
  user_id: string;
  provider: string;
  shop_domain: string;
  secret_encrypted: string;
  scopes: string[];
  webhooks_subscribed: string[];
  status: string;
  last_sync_at: string | null;
  last_error: string | null;
  metadata: Record<string, unknown> & {
    auth?: "client_credentials";
    client_id?: string;
    api_version?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface DecryptedShopifyIntegration {
  id: string;
  user_id: string;
  shop_domain: string;
  client_id: string;
  client_secret: string;
  api_version: string;
  scopes: string[];
  webhooks_subscribed: string[];
  status: string;
}

/**
 * Charge une intégration Shopify active d'un user et décrypte le secret.
 *
 * Multi-boutiques : si `integrationId` est fourni (et appartient au user), on
 * charge CETTE boutique ; sinon on renvoie la boutique PRINCIPALE (la plus
 * ancienne). Ne lève jamais d'erreur quand l'utilisateur a plusieurs boutiques
 * actives (l'ancien `.maybeSingle()` cassait dès la 2e).
 */
export async function getActiveShopifyIntegration(
  userId: string,
  integrationId?: string | null,
): Promise<DecryptedShopifyIntegration | null> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("integrations") as any)
    .select("*")
    .eq("user_id", userId)
    .eq("provider", "shopify")
    .eq("status", "active");
  if (integrationId) query = query.eq("id", integrationId);
  // Boutique principale (la plus ancienne) par défaut ; jamais d'erreur sur >1.
  const { data, error } = await query.order("created_at", { ascending: true }).limit(1);

  const row = (data ?? [])[0];
  if (error || !row) return null;
  return decryptIntegration(row as IntegrationRowV2);
}

/** Toutes les intégrations Shopify actives d'un user, décryptées (principale d'abord). */
export async function listActiveShopifyIntegrations(
  userId: string,
): Promise<DecryptedShopifyIntegration[]> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("integrations") as any)
    .select("*")
    .eq("user_id", userId)
    .eq("provider", "shopify")
    .eq("status", "active")
    .order("created_at", { ascending: true });
  return ((data ?? []) as IntegrationRowV2[]).map(decryptIntegration);
}

export function decryptIntegration(row: IntegrationRowV2): DecryptedShopifyIntegration {
  const client_secret = decryptFromString(row.secret_encrypted);
  const client_id = String(row.metadata?.client_id ?? "");
  const api_version = String(row.metadata?.api_version ?? "2025-01");

  if (!client_id) {
    throw new Error(`Integration ${row.id} : metadata.client_id manquant`);
  }
  return {
    id: row.id,
    user_id: row.user_id,
    shop_domain: row.shop_domain,
    client_id,
    client_secret,
    api_version,
    scopes: row.scopes ?? [],
    webhooks_subscribed: row.webhooks_subscribed ?? [],
    status: row.status,
  };
}

/** Construit un ShopOverride à passer à shopifyAdmin(query, vars, override). */
export function toShopOverride(integration: DecryptedShopifyIntegration) {
  return {
    shopDomain: integration.shop_domain,
    clientId: integration.client_id,
    clientSecret: integration.client_secret,
    apiVersion: integration.api_version,
  };
}

/**
 * Convertit le format V2 (client_credentials) vers le format legacy DecryptedIntegration
 * attendu par sync.ts. Le shop_override est porté pour que shopifyAdmin l'utilise.
 */
export function toLegacyIntegration(integration: DecryptedShopifyIntegration): DecryptedIntegration {
  return {
    id: integration.id,
    user_id: integration.user_id,
    shop_domain: integration.shop_domain,
    scopes: integration.scopes,
    webhook_secret: null,
    shop_override: toShopOverride(integration),
  };
}

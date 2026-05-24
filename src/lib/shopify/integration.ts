/**
 * Helpers serveur pour charger/décrypter une intégration Shopify.
 * NE JAMAIS appeler côté client.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { decrypt, bufferToHex } from "@/lib/encryption";
import type { DecryptedIntegration, IntegrationRow } from "./types";

/**
 * Charge l'intégration Shopify active d'un user et décrypte le token.
 * Retourne null si pas d'intégration active.
 */
export async function getActiveShopifyIntegration(
  userId: string,
): Promise<DecryptedIntegration | null> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("integrations") as any)
    .select("*")
    .eq("user_id", userId)
    .eq("provider", "shopify")
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) return null;
  return decryptIntegration(data as IntegrationRow);
}

/** Charge une intégration par id, vérifie ownership user, et décrypte. */
export async function getIntegrationById(
  integrationId: string,
  userId: string,
): Promise<DecryptedIntegration | null> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("integrations") as any)
    .select("*")
    .eq("id", integrationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return decryptIntegration(data as IntegrationRow);
}

/** Décrypte les champs token + webhook_secret d'une row. */
export function decryptIntegration(row: IntegrationRow): DecryptedIntegration {
  const tokenHex = bufferToHex(row.access_token_encrypted);
  const nonceHex = bufferToHex(row.access_token_nonce);
  if (!tokenHex || !nonceHex) {
    throw new Error(`Integration ${row.id} : token chiffré invalide`);
  }
  const access_token = decrypt({ ciphertext: tokenHex, nonce: nonceHex });

  let webhook_secret: string | null = null;
  if (row.webhook_secret_encrypted && row.webhook_secret_nonce) {
    const wsHex = bufferToHex(row.webhook_secret_encrypted);
    const wsNonceHex = bufferToHex(row.webhook_secret_nonce);
    if (wsHex && wsNonceHex) {
      webhook_secret = decrypt({ ciphertext: wsHex, nonce: wsNonceHex });
    }
  }

  return {
    id: row.id,
    user_id: row.user_id,
    shop_domain: row.shop_domain,
    access_token,
    webhook_secret,
    scopes: row.scopes ?? [],
  };
}

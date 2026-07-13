/**
 * Comptes Google Ads par boutique (table gads_accounts).
 *
 * Multi-comptes : chaque boutique Shopify (integration_id) peut avoir SON compte
 * Google Ads (customer_id), sous-compte du MÊME MCC. Les credentials OAuth sont
 * partagés (env) ; seul le customer_id diffère et vit ici.
 *
 * Écritures via service_role (route owner-gated) ; lectures scopées par user_id.
 */
import { createAdminClient } from "@/lib/supabase/admin";

export interface GadsAccount {
  id: string;
  user_id: string;
  integration_id: string;
  customer_id: string;
  login_customer_id: string | null;
  currency: string | null;
  is_active: boolean;
}

const COLS = "id, user_id, integration_id, customer_id, login_customer_id, currency, is_active";

/** Tous les comptes Google Ads actifs (tous users) — pour le cron de sync. */
export async function listActiveGadsAccounts(): Promise<GadsAccount[]> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("gads_accounts") as any)
    .select(COLS)
    .eq("is_active", true);
  return (data ?? []) as GadsAccount[];
}

/** Comptes Google Ads d'un user (toutes ses boutiques). */
export async function listGadsAccountsForUser(userId: string): Promise<GadsAccount[]> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("gads_accounts") as any)
    .select(COLS)
    .eq("user_id", userId);
  return (data ?? []) as GadsAccount[];
}

/** Compte Google Ads d'une boutique précise (ou null). */
export async function getGadsAccountForIntegration(
  userId: string,
  integrationId: string,
): Promise<GadsAccount | null> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("gads_accounts") as any)
    .select(COLS)
    .eq("user_id", userId)
    .eq("integration_id", integrationId)
    .eq("is_active", true)
    .maybeSingle();
  return (data as GadsAccount | null) ?? null;
}

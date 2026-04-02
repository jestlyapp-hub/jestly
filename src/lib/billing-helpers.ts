/**
 * Billing Helpers — Fonctions centralisées de gestion billing
 *
 * Utilisé par le webhook Stripe et l'endpoint /api/stripe/sync
 * pour garantir un comportement identique dans les deux cas.
 */

import { type SupabaseClient } from "@supabase/supabase-js";

/**
 * Reset un profil vers le plan Starter (gratuit).
 *
 * Appelé quand :
 * - Webhook subscription.deleted
 * - Sync détecte aucune subscription active
 * - Subscription canceled et période expirée
 *
 * Ne supprime PAS stripe_customer_id (le customer existe toujours chez Stripe).
 */
export async function resetToStarter(
  supabase: SupabaseClient,
  userId: string,
  reason: string,
  meta?: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("profiles") as any)
    .update({
      plan: "free",
      subscription_status: "none",
      stripe_subscription_id: null,
      stripe_plan_id: null,
      current_period_end: null,
      trial_ends_at: null,
    })
    .eq("id", userId);

  if (error) {
    console.error(`[billing] resetToStarter failed for user=${userId}:`, error.message);
    return { ok: false, error: error.message };
  }

  // Log dans billing_sync_events
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("billing_sync_events") as any).insert({
    stripe_event_id: `reset_${userId}_${Date.now()}`,
    event_type: "subscription_reset",
    customer_id: meta?.customerId || "local",
    payload: { reason, user_id: userId, ...meta },
    status: "processed",
  }).onConflict("stripe_event_id").ignore();

  console.log(`[billing] ✓ resetToStarter user=${userId} reason=${reason}`);
  return { ok: true };
}

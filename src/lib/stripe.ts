import Stripe from "stripe";
import { type PlanId } from "./plans";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[stripe] STRIPE_SECRET_KEY non configuré — billing intelligence désactivé");
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" })
  : null;

export function isStripeConnected(): boolean {
  return !!stripe;
}

/* ══════════════════════════════════════════════════════════════
   Stripe ↔ Jestly Price Mapping

   Configure les env vars suivantes dans .env.local :
   - STRIPE_PRICE_PRO_MONTHLY
   - STRIPE_PRICE_PRO_YEARLY
   - STRIPE_PRICE_BUSINESS_MONTHLY
   - STRIPE_PRICE_BUSINESS_YEARLY
   ══════════════════════════════════════════════════════════════ */

const PRICE_TO_PLAN: Record<string, PlanId> = {};

// Build map from env at module load
for (const [env, plan] of [
  ["STRIPE_PRICE_PRO_MONTHLY", "pro"],
  ["STRIPE_PRICE_PRO_YEARLY", "pro"],
  ["STRIPE_PRICE_BUSINESS_MONTHLY", "business"],
  ["STRIPE_PRICE_BUSINESS_YEARLY", "business"],
] as const) {
  const priceId = process.env[env];
  if (priceId) PRICE_TO_PLAN[priceId] = plan;
}

/**
 * Résout le plan Jestly depuis un Stripe Price ID.
 *
 * SÉCURITÉ : si le price ID n'est pas reconnu, retourne null.
 * L'appelant DOIT gérer ce cas (ne jamais attribuer un plan premium par défaut).
 */
export function stripePriceToPlan(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  return PRICE_TO_PLAN[priceId] ?? null;
}

/**
 * Renvoie le Stripe Price ID pour un plan et un billing cycle donnés.
 */
export function planToStripePrice(plan: PlanId, yearly = false): string | null {
  const key = yearly
    ? `STRIPE_PRICE_${plan.toUpperCase()}_YEARLY`
    : `STRIPE_PRICE_${plan.toUpperCase()}_MONTHLY`;
  return process.env[key] || null;
}

import Stripe from "stripe";

export interface BillingMetrics {
  mrr: number;             // Monthly Recurring Revenue en centimes
  arr: number;             // Annual = MRR * 12
  active_subscriptions: number;
  trialing_subscriptions: number;
  past_due_subscriptions: number;
  canceled_subscriptions: number;
  arpu: number;            // MRR / active_subscriptions
  trial_to_paid_rate: number | null; // si calculable
}

/**
 * Calcule le MRR réel depuis les abonnements Stripe actifs.
 * MRR = somme des (plan.amount * quantity) normalisés au mois.
 */
export function computeMRR(subscriptions: Stripe.Subscription[]): number {
  let mrr = 0;
  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trialing") continue;
    for (const item of sub.items.data) {
      const price = item.price;
      if (!price.unit_amount) continue;
      const amount = price.unit_amount * (item.quantity || 1);
      // Normaliser au mois
      if (price.recurring?.interval === "month") {
        mrr += amount / (price.recurring.interval_count || 1);
      } else if (price.recurring?.interval === "year") {
        mrr += amount / ((price.recurring.interval_count || 1) * 12);
      } else if (price.recurring?.interval === "week") {
        mrr += (amount * 52) / 12 / (price.recurring.interval_count || 1);
      } else if (price.recurring?.interval === "day") {
        mrr += (amount * 365) / 12 / (price.recurring.interval_count || 1);
      }
    }
  }
  return Math.round(mrr);
}

/**
 * Agrège les métriques billing depuis un tableau de subscriptions Stripe.
 */
export function computeBillingMetrics(subscriptions: Stripe.Subscription[]): BillingMetrics {
  const mrr = computeMRR(subscriptions);
  const active = subscriptions.filter(s => s.status === "active").length;
  const trialing = subscriptions.filter(s => s.status === "trialing").length;
  const pastDue = subscriptions.filter(s => s.status === "past_due").length;
  const canceled = subscriptions.filter(s => s.status === "canceled").length;

  return {
    mrr,
    arr: mrr * 12,
    active_subscriptions: active,
    trialing_subscriptions: trialing,
    past_due_subscriptions: pastDue,
    canceled_subscriptions: canceled,
    arpu: active > 0 ? Math.round(mrr / active) : 0,
    trial_to_paid_rate: null, // Nécessite historique
  };
}

/**
 * Formate un montant en centimes vers EUR lisible.
 */
export function centsToEur(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

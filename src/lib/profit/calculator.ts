/**
 * Profit Engine — calcul de la marge nette réelle.
 *
 * Net = Revenu - COGS - Frais de port payés - Dépense publicitaire attribuée
 *       - Remboursements - Frais de paiement - Frais de transaction
 *
 * Tous les montants sont en centimes (entiers) pour éviter les imprécisions
 * flottantes. Les pourcentages de frais sont exprimés en points (ex : 1.4 = 1,4 %).
 */

export interface OrderProfitInput {
  /** Revenu encaissé de la commande (hors taxes reversées). */
  revenue_cents: number;
  /** Coût des marchandises vendues (somme des COGS des lignes). */
  cogs_cents: number;
  /** Coût de livraison réellement payé par le marchand. */
  shipping_cost_cents: number;
  /** Dépense publicitaire attribuée à la commande (via le moteur MTA). */
  ad_spend_cents: number;
  /** Montant remboursé sur la commande. */
  refunds_cents: number;
  /** Frais du processeur de paiement en pourcentage (ex : 1.4). */
  processor_fee_percent: number;
  /** Frais fixes du processeur par transaction (ex : 25 = 0,25 €). */
  processor_fee_fixed_cents: number;
  /** Frais de transaction Shopify en pourcentage (ex : 0 ou 2.0). */
  transaction_fee_percent: number;
}

export interface ProfitBreakdown {
  revenue_cents: number;
  cogs_cents: number;
  shipping_cents: number;
  ad_spend_cents: number;
  refunds_cents: number;
  processor_fees_cents: number;
  transaction_fees_cents: number;
  net_profit_cents: number;
  /** Marge nette en pourcentage du revenu (null si revenu nul). */
  margin_percent: number | null;
}

function pct(amountCents: number, percent: number): number {
  return Math.round((amountCents * percent) / 100);
}

export function computeOrderProfit(input: OrderProfitInput): ProfitBreakdown {
  const revenue = Math.max(0, Math.round(input.revenue_cents));
  const processorFees = pct(revenue, input.processor_fee_percent) + input.processor_fee_fixed_cents;
  const transactionFees = pct(revenue, input.transaction_fee_percent);

  const net =
    revenue -
    input.cogs_cents -
    input.shipping_cost_cents -
    input.ad_spend_cents -
    input.refunds_cents -
    processorFees -
    transactionFees;

  return {
    revenue_cents: revenue,
    cogs_cents: input.cogs_cents,
    shipping_cents: input.shipping_cost_cents,
    ad_spend_cents: input.ad_spend_cents,
    refunds_cents: input.refunds_cents,
    processor_fees_cents: processorFees,
    transaction_fees_cents: transactionFees,
    net_profit_cents: net,
    margin_percent: revenue > 0 ? Math.round((net / revenue) * 10000) / 100 : null,
  };
}

export interface AggregateProfitInput {
  orders: OrderProfitInput[];
  /** Coûts fixes mensuels (abonnement Shopify, apps, etc.) imputés sur la période. */
  fixed_costs_cents?: number;
}

/**
 * Agrège le profit sur un ensemble de commandes et impute d'éventuels coûts
 * fixes mensuels sur la période.
 */
export function computeAggregateProfit(input: AggregateProfitInput): ProfitBreakdown {
  const empty: ProfitBreakdown = {
    revenue_cents: 0,
    cogs_cents: 0,
    shipping_cents: 0,
    ad_spend_cents: 0,
    refunds_cents: 0,
    processor_fees_cents: 0,
    transaction_fees_cents: 0,
    net_profit_cents: 0,
    margin_percent: null,
  };

  const agg = input.orders.reduce<ProfitBreakdown>((acc, o) => {
    const b = computeOrderProfit(o);
    return {
      revenue_cents: acc.revenue_cents + b.revenue_cents,
      cogs_cents: acc.cogs_cents + b.cogs_cents,
      shipping_cents: acc.shipping_cents + b.shipping_cents,
      ad_spend_cents: acc.ad_spend_cents + b.ad_spend_cents,
      refunds_cents: acc.refunds_cents + b.refunds_cents,
      processor_fees_cents: acc.processor_fees_cents + b.processor_fees_cents,
      transaction_fees_cents: acc.transaction_fees_cents + b.transaction_fees_cents,
      net_profit_cents: acc.net_profit_cents + b.net_profit_cents,
      margin_percent: null,
    };
  }, empty);

  const fixedCosts = Math.max(0, Math.round(input.fixed_costs_cents ?? 0));
  agg.net_profit_cents -= fixedCosts;
  agg.margin_percent =
    agg.revenue_cents > 0
      ? Math.round((agg.net_profit_cents / agg.revenue_cents) * 10000) / 100
      : null;

  return agg;
}

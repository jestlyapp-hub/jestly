/**
 * Moteur de rentabilité réelle (Phase 1 analytics) — fonctions PURES, testées.
 *
 * Règles validées :
 *  - BE-ROAS = seuil de rentabilité PAR COMMANDE → coûts VARIABLES uniquement
 *    (COGS + shipping + payment fees + packaging). Les dépenses récurrentes
 *    n'y entrent jamais : elles ne vivent que dans le Net Profit.
 *  - COGS versionnés : le coût d'une ligne = la version la plus récente dont
 *    effective_from ≤ date de la commande.
 *  - Donnée manquante = null (« non renseigné »), jamais une valeur inventée.
 *  - MER décisionnel = SUM(revenue) / SUM(spend) sur la période.
 */

export interface ProductCostRow {
  shopify_product_id: string;
  unit_cost_cents: number;
  effective_from: string; // YYYY-MM-DD
}

export interface CustomExpenseRow {
  label?: string;
  amount_cents: number;
  period: "monthly" | "yearly";
  starts_on: string; // YYYY-MM-DD
  ends_on: string | null;
}

export interface OrderFees {
  shipping_cost_cents: number;
  payment_fee_percent: number;
  payment_fee_fixed_cents: number;
  packaging_cost_cents: number;
}

export interface BlendedOrder {
  total_cents: number;
  customer_id: string | null;
  created_at: string; // ISO
  line_items: Array<{ product_id?: string | null; quantity?: number | null }>;
}

export interface DateRangeLike { from: string; to: string }

// ── COGS versionnés ──────────────────────────────────────────────
/**
 * Coût unitaire applicable à une date : version la plus récente dont
 * effective_from ≤ date. null = coût non renseigné pour ce produit.
 */
export function resolveUnitCost(
  costs: ProductCostRow[],
  productId: string | null | undefined,
  orderDate: string,
): number | null {
  if (!productId) return null;
  const day = orderDate.slice(0, 10);
  let best: ProductCostRow | null = null;
  for (const c of costs) {
    if (c.shopify_product_id !== productId || c.effective_from > day) continue;
    if (!best || c.effective_from > best.effective_from) best = c;
  }
  return best ? best.unit_cost_cents : null;
}

// ── Dépenses récurrentes au prorata journalier ───────────────────
/** Taux journalier en cents : mensuel × 12 ÷ 365, annuel ÷ 365. */
export function dailyRate(expense: Pick<CustomExpenseRow, "amount_cents" | "period">): number {
  return expense.period === "monthly"
    ? (expense.amount_cents * 12) / 365
    : expense.amount_cents / 365;
}

/** Nombre de jours (bornes incluses) d'intersection avec la plage active. */
function activeDays(expense: CustomExpenseRow, range: DateRangeLike): number {
  const from = expense.starts_on > range.from ? expense.starts_on : range.from;
  const to = expense.ends_on != null && expense.ends_on < range.to ? expense.ends_on : range.to;
  if (from > to) return 0;
  const ms = new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

/** Total des dépenses récurrentes imputables à la plage (cents, arrondi). */
export function prorateExpenses(expenses: CustomExpenseRow[], range: DateRangeLike): number {
  let total = 0;
  for (const e of expenses) total += dailyRate(e) * activeDays(e, range);
  return Math.round(total);
}

// ── Blended stats ────────────────────────────────────────────────
export interface CogsBreakdown {
  cogs_cents: number;
  total_units: number;
  covered_units: number;
  /** Part des unités vendues dont le coût est renseigné (0-1). */
  coverage: number;
}

export function computeOrdersCogs(orders: BlendedOrder[], costs: ProductCostRow[]): CogsBreakdown {
  let cogs = 0, totalUnits = 0, coveredUnits = 0;
  for (const o of orders) {
    for (const li of o.line_items ?? []) {
      const qty = Number(li.quantity ?? 0);
      if (qty <= 0) continue;
      totalUnits += qty;
      const unit = resolveUnitCost(costs, li.product_id ?? null, o.created_at);
      if (unit != null) {
        coveredUnits += qty;
        cogs += unit * qty;
      }
    }
  }
  return {
    cogs_cents: cogs,
    total_units: totalUnits,
    covered_units: coveredUnits,
    coverage: totalUnits > 0 ? coveredUnits / totalUnits : 0,
  };
}

export interface BlendedStats {
  range: DateRangeLike;
  orders_count: number;
  revenue_cents: number;
  spend_cents: number;
  /** Revenue / Blended Spend — insensible aux ventes fantômes. */
  mer: number | null;
  aov_cents: number | null;
  // Nouveaux clients (1re commande du customer_id, tout historique confondu)
  new_customers: number;
  nc_revenue_cents: number;
  nc_roas: number | null;
  ncpa_cents: number | null;
  // Coûts
  costs_configured: boolean;
  cogs: CogsBreakdown;
  /** Coût variable complet moyen par commande (COGS + shipping + fees + packaging). */
  variable_cost_per_order_cents: number | null;
  /**
   * AOV / (AOV − coût variable moyen). null si coûts non configurés, ou si la
   * marge unitaire est ≤ 0 (aucun ROAS ne peut rentabiliser → be_roas_reachable
   * à false, jamais un nombre inventé).
   */
  be_roas: number | null;
  be_roas_reachable: boolean;
  expenses_prorated_cents: number;
  net_profit_cents: number | null;
  net_margin: number | null;
  /** Statut de vérité : MER vs BE-ROAS + Net Profit. */
  status: "profitable" | "unprofitable" | "insufficient_data";
  /** Écart MER − BE-ROAS (positif = au-dessus du seuil de rentabilité). */
  mer_vs_be_roas: number | null;
}

const round2 = (v: number): number => Math.round(v * 100) / 100;

export function computeBlendedStats(input: {
  orders: BlendedOrder[];
  spend_cents: number;
  costs: ProductCostRow[];
  fees: OrderFees;
  expenses: CustomExpenseRow[];
  range: DateRangeLike;
  /** customer_id → created_at de sa toute première commande (historique complet). */
  firstOrderAtByCustomer: Map<string, string>;
}): BlendedStats {
  const { orders, spend_cents, costs, fees, expenses, range, firstOrderAtByCustomer } = input;

  const ordersCount = orders.length;
  const revenue = orders.reduce((s, o) => s + o.total_cents, 0);
  const aov = ordersCount > 0 ? revenue / ordersCount : null;

  // Nouveaux clients : la commande est la toute première de son customer_id.
  // Sans customer_id (invité inconnu) → compté nouveau, faute de mieux.
  let newCustomers = 0, ncRevenue = 0;
  for (const o of orders) {
    const first = o.customer_id ? firstOrderAtByCustomer.get(o.customer_id) : undefined;
    const isNew = !o.customer_id || first == null || o.created_at <= first;
    if (isNew) {
      newCustomers += 1;
      ncRevenue += o.total_cents;
    }
  }

  const cogs = computeOrdersCogs(orders, costs);
  const feesConfigured =
    fees.shipping_cost_cents > 0 || fees.payment_fee_percent > 0 ||
    fees.payment_fee_fixed_cents > 0 || fees.packaging_cost_cents > 0;
  const costsConfigured = costs.length > 0 || feesConfigured;

  // Coût variable complet moyen / commande (base BE-ROAS)
  let variableCostPerOrder: number | null = null;
  let beRoas: number | null = null;
  let beReachable = true;
  const perOrderFixedFees = fees.shipping_cost_cents + fees.payment_fee_fixed_cents + fees.packaging_cost_cents;
  const paymentFeesTotal = Math.round(revenue * (fees.payment_fee_percent / 100)) + fees.payment_fee_fixed_cents * ordersCount;

  if (costsConfigured && ordersCount > 0 && aov != null) {
    variableCostPerOrder =
      cogs.cogs_cents / ordersCount + perOrderFixedFees + aov * (fees.payment_fee_percent / 100);
    const unitMargin = aov - variableCostPerOrder;
    if (unitMargin > 0) {
      beRoas = round2(aov / unitMargin);
    } else {
      beReachable = false; // marge unitaire ≤ 0 : aucun ROAS ne rentabilise
    }
  }

  // Net Profit = Revenue − COGS − Spend − shipping − payment fees − packaging − récurrentes
  const expensesProrated = prorateExpenses(expenses, range);
  const netProfit = costsConfigured
    ? revenue - cogs.cogs_cents - spend_cents
      - fees.shipping_cost_cents * ordersCount
      - paymentFeesTotal
      - fees.packaging_cost_cents * ordersCount
      - expensesProrated
    : null;

  const merClean = spend_cents > 0 ? Math.round((revenue / spend_cents) * 10000) / 10000 : null;

  let status: BlendedStats["status"] = "insufficient_data";
  if (costsConfigured && ordersCount > 0) {
    if (!beReachable) status = "unprofitable";
    else if (merClean != null && beRoas != null) status = merClean >= beRoas ? "profitable" : "unprofitable";
    else if (netProfit != null) status = netProfit >= 0 ? "profitable" : "unprofitable";
  }

  return {
    range,
    orders_count: ordersCount,
    revenue_cents: revenue,
    spend_cents,
    mer: merClean,
    aov_cents: aov != null ? Math.round(aov) : null,
    new_customers: newCustomers,
    nc_revenue_cents: ncRevenue,
    nc_roas: spend_cents > 0 ? Math.round((ncRevenue / spend_cents) * 10000) / 10000 : null,
    ncpa_cents: newCustomers > 0 && spend_cents > 0 ? Math.round(spend_cents / newCustomers) : null,
    costs_configured: costsConfigured,
    cogs,
    variable_cost_per_order_cents: variableCostPerOrder != null ? Math.round(variableCostPerOrder) : null,
    be_roas: beRoas,
    be_roas_reachable: beReachable,
    expenses_prorated_cents: expensesProrated,
    net_profit_cents: netProfit,
    net_margin: netProfit != null && revenue > 0 ? Math.round((netProfit / revenue) * 10000) / 10000 : null,
    status,
    mer_vs_be_roas: merClean != null && beRoas != null ? round2(merClean - beRoas) : null,
  };
}

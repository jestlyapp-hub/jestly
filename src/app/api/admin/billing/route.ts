import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { stripe, isStripeConnected } from "@/lib/stripe";
import { computeBillingMetrics } from "@/lib/billing-intelligence";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const sb = auth.adminClient;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // ── Revenue from orders ──────────────────────────────────────────
  const [revenueAllRes, revenueWeekRes, revenueMonthRes] = await Promise.all([
    (sb.from("orders") as any)
      .select("amount")
      .in("status", ["paid", "delivered", "invoiced"]),
    (sb.from("orders") as any)
      .select("amount")
      .in("status", ["paid", "delivered", "invoiced"])
      .gte("created_at", weekAgo),
    (sb.from("orders") as any)
      .select("amount")
      .in("status", ["paid", "delivered", "invoiced"])
      .gte("created_at", monthAgo),
  ]);

  const sumAmounts = (rows: { amount: number | null }[] | null) =>
    (rows || []).reduce((s, o) => s + (o.amount || 0), 0);

  const total = sumAmounts(revenueAllRes.data);
  const this_week = sumAmounts(revenueWeekRes.data);
  const this_month = sumAmounts(revenueMonthRes.data);

  // ── Orders by status ─────────────────────────────────────────────
  const { data: allOrders } = await (sb.from("orders") as any).select("status");

  const orders_by_status: Record<string, number> = {};
  (allOrders || []).forEach((o: { status: string }) => {
    orders_by_status[o.status] = (orders_by_status[o.status] || 0) + 1;
  });

  // ── Plan distribution ────────────────────────────────────────────
  const { data: profiles } = await (sb.from("profiles") as any).select("plan");

  const plan_distribution: Record<string, number> = { free: 0, pro: 0 };
  (profiles || []).forEach((p: { plan: string | null }) => {
    const plan = p.plan || "free";
    plan_distribution[plan] = (plan_distribution[plan] || 0) + 1;
  });

  // ── Billing items ────────────────────────────────────────────────
  const [billingCountRes, billingTotalRes] = await Promise.all([
    (sb.from("billing_items") as any).select("id", { count: "exact", head: true }),
    (sb.from("billing_items") as any).select("total"),
  ]);

  const billing_items_count = billingCountRes.count ?? 0;
  const billing_items_total_ht = (billingTotalRes.data || []).reduce(
    (s: number, b: { total: number | null }) => s + (b.total || 0),
    0,
  );

  // ── Recent paid orders with user email ───────────────────────────
  const { data: recentPaidRaw } = await (sb.from("orders") as any)
    .select("id, amount, status, created_at, user_id")
    .in("status", ["paid", "delivered", "invoiced"])
    .order("created_at", { ascending: false })
    .limit(10);

  const recent_paid_orders = await Promise.all(
    (recentPaidRaw || []).map(async (o: any) => {
      let user_email = "—";
      if (o.user_id) {
        const { data: profile } = await (sb.from("profiles") as any)
          .select("email")
          .eq("id", o.user_id)
          .single();
        user_email = profile?.email || "—";
      }
      return {
        id: o.id,
        amount: o.amount,
        status: o.status,
        created_at: o.created_at,
        user_email,
      };
    }),
  );

  // ── Stripe billing intelligence (optionnel) ──────────────────────
  let stripeMetrics = null;
  let stripeSubscriptionsCount = 0;
  let stripeFailedPayments: any[] = [];

  if (isStripeConnected() && stripe) {
    try {
      // Récupérer tous les abonnements
      const subs = await stripe.subscriptions.list({
        limit: 100,
        expand: ["data.items.data.price"],
      });
      stripeSubscriptionsCount = subs.data.length;
      stripeMetrics = computeBillingMetrics(subs.data);

      // Paiements échoués (30 derniers jours)
      const thirtyDaysAgo = Math.floor((Date.now() - 30 * 86400000) / 1000);
      const failedInvoices = await stripe.invoices.list({
        limit: 20,
        status: "open",
        created: { gte: thirtyDaysAgo },
      });
      stripeFailedPayments = failedInvoices.data
        .filter(inv => inv.attempted && inv.status !== "paid")
        .map(inv => ({
          id: inv.id,
          customer: inv.customer,
          amount: inv.amount_due,
          created: inv.created,
          attempt_count: inv.attempt_count,
          customer_email: inv.customer_email,
        }));
    } catch (err) {
      console.error("[admin/billing] Stripe error:", err);
    }
  }

  // ── Response ─────────────────────────────────────────────────────
  return NextResponse.json({
    revenue: { total, this_week, this_month },
    orders_by_status,
    plan_distribution,
    billing_items_count,
    billing_items_total_ht,
    recent_paid_orders,
    stripe_connected: isStripeConnected(),
    stripe_metrics: stripeMetrics,
    stripe_subscriptions_count: stripeSubscriptionsCount,
    stripe_failed_payments: stripeFailedPayments,
  });
}

import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { normalizePlanId, currentMonthBounds } from "@/lib/plans";

/**
 * GET /api/subscription
 *
 * Renvoie le plan actuel et l'usage de l'utilisateur.
 * Consommé par le hook useSubscription() côté client.
 */
export async function GET() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // Plan + billing fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("plan, subscription_status, current_period_end, stripe_customer_id, stripe_subscription_id, stripe_plan_id, trial_ends_at")
    .eq("id", user.id)
    .single();

  const planId = normalizePlanId(profile?.plan);

  // Usage — requêtes en parallèle
  const { start, end } = currentMonthBounds();

  const [sitesRes, ordersRes, projectsRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("sites") as any)
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("orders") as any)
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", `${start}T00:00:00`)
      .lte("created_at", `${end}T23:59:59`),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("projects") as any)
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .neq("status", "archived"),
  ]);

  return NextResponse.json({
    planId,
    subscriptionStatus: profile?.subscription_status || "none",
    currentPeriodEnd: profile?.current_period_end || null,
    trialEndsAt: profile?.trial_ends_at || null,
    hasStripeCustomer: !!profile?.stripe_customer_id,
    hasSubscription: !!profile?.stripe_subscription_id,
    usage: {
      sites: sitesRes.count ?? 0,
      ordersThisMonth: ordersRes.count ?? 0,
      activeProjects: projectsRes.count ?? 0,
    },
  });
}

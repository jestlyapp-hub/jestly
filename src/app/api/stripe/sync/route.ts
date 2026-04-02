import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { stripe, stripePriceToPlan } from "@/lib/stripe";
import { resetToStarter } from "@/lib/billing-helpers";

/**
 * POST /api/stripe/sync
 *
 * Resynchronise l'état abonnement depuis Stripe vers la DB locale.
 * Utilisé comme filet de sécurité quand le webhook rate ou tarde.
 *
 * Appelé automatiquement :
 * - au retour du checkout (?success=true)
 * - à l'ouverture de la page /abonnement si incohérence détectée
 * - manuellement en cas de debug
 */
export async function POST() {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });
  }

  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // Récupérer le stripe_customer_id du profil
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("stripe_customer_id, stripe_subscription_id, plan")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ synced: false, reason: "no_stripe_customer" });
  }

  try {
    // Lister les subscriptions actives de ce customer
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: "all",
      limit: 5,
      expand: ["data.items.data.price"],
    });

    // Trouver la subscription active/trialing la plus récente
    const activeSub = subscriptions.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );

    if (activeSub) {
      const priceId = activeSub.items.data[0]?.price?.id || null;
      const resolvedPlan = stripePriceToPlan(priceId);
      const plan = resolvedPlan || profile.plan || "free"; // si price inconnu, garder le plan actuel

      const rawPeriodEnd = (activeSub as unknown as Record<string, unknown>).current_period_end as number | undefined;
      const periodEnd = rawPeriodEnd ? new Date(rawPeriodEnd * 1000).toISOString() : null;

      const rawPeriodStart = (activeSub as unknown as Record<string, unknown>).current_period_start as number | undefined;
      const periodStart = rawPeriodStart ? new Date(rawPeriodStart * 1000).toISOString() : null;

      const trialEnd = activeSub.trial_end
        ? new Date(activeSub.trial_end * 1000).toISOString()
        : null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateErr } = await (supabase.from("profiles") as any)
        .update({
          plan,
          stripe_subscription_id: activeSub.id,
          stripe_plan_id: priceId,
          subscription_status: activeSub.status,
          current_period_end: periodEnd,
          trial_ends_at: trialEnd,
        })
        .eq("id", user.id);

      if (updateErr) {
        console.error("[stripe/sync] DB update error:", updateErr.message);
        return NextResponse.json({ synced: false, error: updateErr.message }, { status: 500 });
      }

      console.log(`[stripe/sync] ✓ user=${user.id} plan=${plan} status=${activeSub.status} sub=${activeSub.id}`);

      return NextResponse.json({
        synced: true,
        plan,
        status: activeSub.status,
        cancelAtPeriodEnd: activeSub.cancel_at_period_end,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        priceId,
      });
    }

    // Pas de subscription active → vérifier si canceled récemment
    const canceledSub = subscriptions.data.find((s) => s.status === "canceled");

    if (canceledSub) {
      // Vérifier si la période est encore valide
      const rawEnd = (canceledSub as unknown as Record<string, unknown>).current_period_end as number | undefined;
      const periodEndDate = rawEnd ? new Date(rawEnd * 1000) : null;
      const stillInPeriod = periodEndDate && periodEndDate > new Date();

      if (stillInPeriod) {
        // La subscription est annulée mais la période payée n'est pas finie
        // → garder le plan actuel jusqu'à l'échéance
        console.log(`[stripe/sync] Subscription canceled but period still active until ${periodEndDate?.toISOString()}`);
        return NextResponse.json({
          synced: true,
          plan: profile.plan,
          status: "canceled",
          cancelAtPeriodEnd: true,
          currentPeriodEnd: periodEndDate?.toISOString(),
          note: "Abonnement annulé, accès maintenu jusqu'à l'échéance",
        });
      }
    }

    // Aucune subscription active et période expirée → reset vers Starter
    const result = await resetToStarter(supabase, user.id, "no_active_subscription", {
      customerId: profile.stripe_customer_id,
    });

    if (!result.ok) {
      return NextResponse.json({ synced: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ synced: true, plan: "starter", status: "none" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[stripe/sync] Stripe API error:", msg);
    return NextResponse.json({ synced: false, error: msg }, { status: 500 });
  }
}

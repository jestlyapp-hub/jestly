import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { stripe, planToStripePrice } from "@/lib/stripe";
import type { PlanId } from "@/lib/plans";

/**
 * POST /api/stripe/checkout
 *
 * Crée une Stripe Checkout Session pour l'upgrade.
 * Body: { plan: "pro" | "business", yearly?: boolean }
 * Retourne: { url: string } — URL de redirection vers Stripe
 */
export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });
  }

  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const body = await req.json();
  const plan = body.plan as PlanId;
  const yearly = body.yearly === true;

  if (!plan || !["pro", "business"].includes(plan)) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  const priceId = planToStripePrice(plan, yearly);
  if (!priceId) {
    return NextResponse.json(
      { error: `Prix Stripe non configuré pour ${plan} (${yearly ? "annuel" : "mensuel"}). Configurez STRIPE_PRICE_${plan.toUpperCase()}_${yearly ? "YEARLY" : "MONTHLY"} dans .env.local.` },
      { status: 500 },
    );
  }

  // Récupérer ou créer le Stripe Customer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("stripe_customer_id, email, full_name, business_name")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email || user.email,
      name: profile?.business_name || profile?.full_name || undefined,
      metadata: { jestly_user_id: user.id },
    });
    customerId = customer.id;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profiles") as any)
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  // Créer la checkout session
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.NEXT_PUBLIC_BASE_DOMAIN || "jestly.fr"}`;

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/abonnement?success=true`,
    cancel_url: `${baseUrl}/abonnement?canceled=true`,
    metadata: { jestly_user_id: user.id, plan },
    subscription_data: {
      metadata: { jestly_user_id: user.id, plan },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}

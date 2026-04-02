import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { stripe } from "@/lib/stripe";

/**
 * POST /api/stripe/portal
 *
 * Crée une session Stripe Billing Portal pour gérer l'abonnement.
 * Retourne: { url: string } — URL de redirection vers le portail Stripe
 */
export async function POST() {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });
  }

  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "Aucun abonnement Stripe trouvé. Commencez par souscrire à un plan." },
      { status: 404 },
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.NEXT_PUBLIC_BASE_DOMAIN || "jestly.fr"}`;

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${baseUrl}/abonnement`,
  });

  return NextResponse.json({ url: session.url });
}

import { NextRequest, NextResponse } from "next/server";
import { stripe, stripePriceToPlan } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

// Stripe webhook handler — synchronise billing data
export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[stripe webhook] Signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

        // Résoudre le plan depuis le Stripe Price ID
        const priceId = subscription.items?.data?.[0]?.price?.id || null;
        const isActive = subscription.status === "active" || subscription.status === "trialing";

        let plan: string;
        let syncStatus: string = "processed";

        if (!isActive) {
          // Subscription inactive → retour au plan gratuit
          plan = "free";
        } else {
          const resolved = stripePriceToPlan(priceId);
          if (resolved) {
            plan = resolved;
          } else {
            // SÉCURITÉ : price ID inconnu → NE PAS attribuer de plan premium
            // Conserver le plan actuel, loguer l'erreur pour investigation
            console.error(`[stripe webhook] CRITICAL: price ID inconnu "${priceId}" — plan NON modifié`);
            syncStatus = "failed";

            // Loguer dans billing_sync_events avec statut failed
            await (supabase.from("billing_sync_events") as any).insert({
              stripe_event_id: event.id,
              event_type: event.type,
              customer_id: customerId,
              payload: { subscription_id: subscription.id, status: subscription.status, price_id: priceId, error: "unknown_price_id" },
              status: "failed",
              error_message: `Price ID inconnu: ${priceId}. Vérifiez les env vars STRIPE_PRICE_*.`,
            }).onConflict("stripe_event_id").ignore();

            // Log audit
            await (supabase.from("admin_audit_logs") as any).insert({
              actor_id: "00000000-0000-0000-0000-000000000000",
              actor_email: "system@stripe",
              action: `stripe.${event.type}.error`,
              target_type: "billing",
              target_id: customerId,
              metadata: { subscription_id: subscription.id, error: "unknown_price_id", price_id: priceId },
              ip_address: "stripe-webhook",
              result: "error",
            });
            break; // Ne pas modifier le plan
          }
        }

        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;
        const rawPeriodEnd = (subscription as any).current_period_end;
        const periodEnd = rawPeriodEnd ? new Date(rawPeriodEnd * 1000).toISOString() : null;

        // Mettre à jour le profil
        const { error: updateErr } = await (supabase.from("profiles") as any)
          .update({
            stripe_subscription_id: subscription.id,
            stripe_plan_id: priceId,
            plan,
            subscription_status: subscription.status,
            trial_ends_at: trialEnd,
            current_period_end: periodEnd,
          })
          .eq("stripe_customer_id", customerId);

        if (updateErr) {
          console.error(`[stripe webhook] Profile update failed for customer ${customerId}:`, updateErr.message);
          syncStatus = "failed";
        }

        console.log(`[stripe webhook] ${event.type} | customer=${customerId} | plan=${plan} | status=${subscription.status} | price=${priceId}`);

        // Log dans billing_sync_events (idempotence via stripe_event_id)
        await (supabase.from("billing_sync_events") as any).insert({
          stripe_event_id: event.id,
          event_type: event.type,
          customer_id: customerId,
          payload: { subscription_id: subscription.id, status: subscription.status, plan, price_id: priceId, trial_end: trialEnd, period_end: periodEnd },
          status: syncStatus,
          error_message: updateErr?.message || null,
        }).onConflict("stripe_event_id").ignore();

        // Log dans audit
        await (supabase.from("admin_audit_logs") as any).insert({
          actor_id: "00000000-0000-0000-0000-000000000000",
          actor_email: "system@stripe",
          action: `stripe.${event.type}`,
          target_type: "billing",
          target_id: customerId,
          metadata: { subscription_id: subscription.id, status: subscription.status, plan, price_id: priceId },
          ip_address: "stripe-webhook",
          result: syncStatus === "processed" ? "success" : "error",
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id;

        // Log dans billing_sync_events
        await (supabase.from("billing_sync_events") as any).insert({
          stripe_event_id: event.id,
          event_type: event.type,
          customer_id: customerId || "unknown",
          payload: {
            invoice_id: invoice.id,
            amount: invoice.amount_due,
            attempt_count: invoice.attempt_count,
          },
          status: "processed",
        }).onConflict("stripe_event_id").ignore();

        // Log audit
        await (supabase.from("admin_audit_logs") as any).insert({
          actor_id: "00000000-0000-0000-0000-000000000000",
          actor_email: "system@stripe",
          action: "stripe.payment_failed",
          target_type: "billing",
          target_id: customerId || "unknown",
          metadata: { invoice_id: invoice.id, amount: invoice.amount_due, attempt_count: invoice.attempt_count },
          ip_address: "stripe-webhook",
          result: "success",
        });
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = typeof session.customer === "string"
          ? session.customer
          : (session.customer as Stripe.Customer)?.id;
        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : (session.subscription as Stripe.Subscription)?.id;
        const userId = session.metadata?.jestly_user_id;
        const sessionPlan = session.metadata?.plan;

        console.log(`[stripe webhook] checkout.session.completed | customer=${customerId} | sub=${subscriptionId} | user=${userId} | plan=${sessionPlan}`);

        // Synchroniser le profil directement depuis les métadonnées du checkout
        if (userId && subscriptionId && sessionPlan) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from("profiles") as any)
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan: sessionPlan,
              subscription_status: "active",
            })
            .eq("id", userId);
        } else if (customerId && subscriptionId) {
          // Fallback: mettre à jour via customer ID
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from("profiles") as any)
            .update({
              stripe_subscription_id: subscriptionId,
              subscription_status: "active",
            })
            .eq("stripe_customer_id", customerId);
        }

        // Log
        await (supabase.from("billing_sync_events") as any).insert({
          stripe_event_id: event.id,
          event_type: event.type,
          customer_id: customerId || "unknown",
          payload: { session_id: session.id, subscription_id: subscriptionId, plan: sessionPlan, user_id: userId },
          status: "processed",
        }).onConflict("stripe_event_id").ignore();

        break;
      }

      case "customer.created": {
        const customer = event.data.object as Stripe.Customer;
        // Lier le customer au profil par email
        if (customer.email) {
          await (supabase.from("profiles") as any)
            .update({ stripe_customer_id: customer.id })
            .eq("email", customer.email);
        }
        break;
      }
    }
  } catch (err) {
    console.error("[stripe webhook] Processing error:", err);
    return NextResponse.json({ error: "Erreur lors du traitement" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

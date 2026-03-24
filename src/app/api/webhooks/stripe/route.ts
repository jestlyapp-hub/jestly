import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
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

        // Mettre à jour le profil avec colonnes V4
        const plan = (subscription.status === "active" || subscription.status === "trialing") ? "pro" : "free";
        const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;
        // current_period_end peut être sur l'objet directement ou non selon la version de l'API Stripe
        const rawPeriodEnd = (subscription as any).current_period_end;
        const periodEnd = rawPeriodEnd ? new Date(rawPeriodEnd * 1000).toISOString() : null;

        await (supabase.from("profiles") as any)
          .update({
            stripe_subscription_id: subscription.id,
            stripe_plan_id: subscription.items.data[0]?.price?.id || null,
            plan,
            subscription_status: subscription.status,
            trial_ends_at: trialEnd,
            current_period_end: periodEnd,
          })
          .eq("stripe_customer_id", customerId);

        // Log dans billing_sync_events (idempotence via stripe_event_id)
        await (supabase.from("billing_sync_events") as any).insert({
          stripe_event_id: event.id,
          event_type: event.type,
          customer_id: customerId,
          payload: {
            subscription_id: subscription.id,
            status: subscription.status,
            plan,
            trial_end: trialEnd,
            period_end: periodEnd,
          },
          status: "processed",
        }).onConflict("stripe_event_id").ignore();

        // Log dans audit
        await (supabase.from("admin_audit_logs") as any).insert({
          actor_id: "00000000-0000-0000-0000-000000000000",
          actor_email: "system@stripe",
          action: `stripe.${event.type}`,
          target_type: "billing",
          target_id: customerId,
          metadata: { subscription_id: subscription.id, status: subscription.status, plan },
          ip_address: "stripe-webhook",
          result: "success",
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

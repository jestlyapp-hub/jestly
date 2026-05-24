/**
 * POST /api/ecom/webhooks/shopify
 * Endpoint public — reçoit les webhooks Shopify.
 * Vérifie signature HMAC, log, dispatch vers handler approprié.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  parseWebhookHeaders,
  verifyWebhookSignature,
  logWebhookEvent,
  dispatchWebhook,
} from "@/lib/shopify/webhooks";
import { decryptIntegration } from "@/lib/shopify/integration";
import type { IntegrationRow } from "@/lib/shopify/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const headersInfo = parseWebhookHeaders(req.headers);
  if (!headersInfo) {
    return NextResponse.json({ error: "Headers Shopify manquants" }, { status: 400 });
  }

  const rawBody = await req.text();
  const supabase = createAdminClient();

  // Trouver l'intégration matching le shop_domain
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = await (supabase.from("integrations") as any)
    .select("*")
    .eq("provider", "shopify")
    .eq("shop_domain", headersInfo.shopDomain)
    .eq("status", "active")
    .maybeSingle();

  if (!row) {
    // On répond 200 quand même pour éviter retry Shopify infini si l'intégration a été supprimée
    return NextResponse.json({ ok: true, ignored: "no integration" });
  }

  const integration = decryptIntegration(row as IntegrationRow);
  const webhookSecret = integration.webhook_secret;

  let signatureValid = false;
  if (webhookSecret) {
    signatureValid = verifyWebhookSignature(rawBody, headersInfo.hmacSha256, webhookSecret);
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!signatureValid && webhookSecret) {
    await logWebhookEvent(integration.id, headersInfo.topic, headersInfo.shopifyId ?? null, payload, false, "Invalid HMAC");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    await dispatchWebhook(integration.id, headersInfo.topic, payload);
    await logWebhookEvent(integration.id, headersInfo.topic, headersInfo.shopifyId ?? null, payload, signatureValid);
    return NextResponse.json({ ok: true });
  } catch (err) {
    await logWebhookEvent(
      integration.id, headersInfo.topic, headersInfo.shopifyId ?? null,
      payload, signatureValid, (err as Error).message,
    );
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

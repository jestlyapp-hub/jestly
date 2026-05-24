/**
 * POST /api/ecom/webhooks/shopify
 * Endpoint public — reçoit les webhooks Shopify.
 *
 * V1 finale : l'HMAC secret est le `client_secret` (Dev Dashboard app) = même
 * valeur que celle chiffrée dans `integrations.secret_encrypted`. On lit
 * l'intégration via le shop_domain header pour récupérer ce secret.
 *
 * CRITIQUE : on lit le raw body (pas .json()) pour calculer l'HMAC.
 */
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  parseWebhookHeaders,
  logWebhookEvent,
  dispatchWebhook,
} from "@/lib/shopify/webhooks";
import { decryptIntegration, type IntegrationRowV2 } from "@/lib/shopify/integration";

export const dynamic = "force-dynamic";

function timingSafeCompare(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export async function POST(req: NextRequest) {
  const headersInfo = parseWebhookHeaders(req.headers);
  if (!headersInfo) {
    return NextResponse.json({ error: "Headers Shopify manquants" }, { status: 400 });
  }

  // CRITIQUE : raw body pour HMAC
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
    // Répondre 200 pour éviter retry Shopify infini si l'intégration a été supprimée
    return NextResponse.json({ ok: true, ignored: "no integration" });
  }

  let integration;
  try {
    integration = decryptIntegration(row as IntegrationRowV2);
  } catch (err) {
    return NextResponse.json({ error: `Décryptage échoué: ${(err as Error).message}` }, { status: 500 });
  }

  // L'HMAC secret = client_secret (Dev Dashboard apps)
  const webhookSecret = integration.client_secret;
  const computed = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody, "utf8")
    .digest("base64");
  const signatureValid = timingSafeCompare(computed, headersInfo.hmacSha256);

  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!signatureValid) {
    await logWebhookEvent(integration.id, headersInfo.topic, headersInfo.shopifyId ?? null, payload, false, "Invalid HMAC");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    await dispatchWebhook(integration.id, headersInfo.topic, payload);
    await logWebhookEvent(integration.id, headersInfo.topic, headersInfo.shopifyId ?? null, payload, true);
    return NextResponse.json({ ok: true });
  } catch (err) {
    await logWebhookEvent(
      integration.id, headersInfo.topic, headersInfo.shopifyId ?? null,
      payload, true, (err as Error).message,
    );
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

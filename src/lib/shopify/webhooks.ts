/**
 * Vérification HMAC + handlers webhooks Shopify.
 * Cf https://shopify.dev/docs/apps/webhooks/configuration/https#step-5-verify-the-webhook
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ShopifyWebhookHeaders {
  topic: string;
  shopDomain: string;
  hmacSha256: string;
  shopifyId?: string;
}

/** Extrait les headers Shopify d'une Headers Web. */
export function parseWebhookHeaders(headers: Headers): ShopifyWebhookHeaders | null {
  const topic = headers.get("x-shopify-topic");
  const shopDomain = headers.get("x-shopify-shop-domain");
  const hmacSha256 = headers.get("x-shopify-hmac-sha256");
  const shopifyId = headers.get("x-shopify-webhook-id") ?? undefined;
  if (!topic || !shopDomain || !hmacSha256) return null;
  return { topic, shopDomain, hmacSha256, shopifyId };
}

/** Vérifie la signature HMAC SHA-256. */
export function verifyWebhookSignature(
  rawBody: string,
  hmacHeader: string,
  webhookSecret: string,
): boolean {
  const computed = createHmac("sha256", webhookSecret).update(rawBody, "utf8").digest("base64");
  try {
    const a = Buffer.from(computed);
    const b = Buffer.from(hmacHeader);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Stocke un event webhook brut dans shopify_webhook_events. */
export async function logWebhookEvent(
  integrationId: string,
  topic: string,
  shopifyId: string | null,
  payload: unknown,
  signatureValid: boolean,
  error?: string,
): Promise<void> {
  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("shopify_webhook_events") as any).insert({
    integration_id: integrationId,
    topic,
    shopify_id: shopifyId,
    payload,
    signature_valid: signatureValid,
    processed_at: error ? null : new Date().toISOString(),
    error: error ?? null,
  });
}

/** Dispatch d'un payload webhook vers la mise à jour du cache approprié. */
export async function dispatchWebhook(
  integrationId: string,
  topic: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const supabase = createAdminClient();

  switch (topic) {
    case "orders/create":
    case "orders/updated":
    case "orders/paid":
    case "orders/fulfilled":
    case "orders/cancelled": {
      // Webhooks REST renvoient un format différent du GraphQL — on stocke en raw.
      // Pour le V1, on déclenche juste un re-fetch via delta sync au prochain cron.
      // Update minimal du cache : marquer la row updated_at.
      const orderId = String(payload.id ?? "");
      if (orderId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("shopify_orders") as any)
          .update({
            financial_status: (payload.financial_status as string) ?? null,
            fulfillment_status: (payload.fulfillment_status as string) ?? null,
            updated_at: (payload.updated_at as string) ?? new Date().toISOString(),
            cancelled_at: (payload.cancelled_at as string) ?? null,
          })
          .eq("integration_id", integrationId)
          .eq("shopify_order_id", orderId);
      }
      break;
    }
    case "products/create":
    case "products/update": {
      const productId = String(payload.id ?? "");
      if (productId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("shopify_products") as any)
          .update({
            title: (payload.title as string) ?? undefined,
            status: ((payload.status as string) ?? "").toUpperCase() || null,
            updated_at: (payload.updated_at as string) ?? new Date().toISOString(),
          })
          .eq("integration_id", integrationId)
          .eq("shopify_product_id", productId);
      }
      break;
    }
    case "products/delete": {
      const productId = String(payload.id ?? "");
      if (productId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("shopify_products") as any)
          .delete()
          .eq("integration_id", integrationId)
          .eq("shopify_product_id", productId);
      }
      break;
    }
    case "customers/create":
    case "customers/update": {
      const customerId = String(payload.id ?? "");
      if (customerId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("shopify_customers") as any)
          .update({
            email: (payload.email as string) ?? null,
            first_name: (payload.first_name as string) ?? null,
            last_name: (payload.last_name as string) ?? null,
            updated_at: (payload.updated_at as string) ?? new Date().toISOString(),
          })
          .eq("integration_id", integrationId)
          .eq("shopify_customer_id", customerId);
      }
      break;
    }
    case "app/uninstalled": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("integrations") as any)
        .update({ status: "disconnected", last_error: "App uninstalled" })
        .eq("id", integrationId);
      break;
    }
    default:
      // inventory_levels/update, checkouts/*, etc. — logué mais pas traité en V1
      break;
  }
}

/**
 * POST /api/integrations/shopify/seed-lhorloge
 * Réservé à Gabriel (user_id ef7a948f-...).
 *
 * Persiste l'intégration Lhorlogemurale depuis les env vars SHOPIFY_LHORLOGEMURALE_*
 * (au lieu de demander à l'user de taper les creds). Idempotent.
 * Déclenche l'initial sync en background.
 */
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptToString } from "@/lib/encryption";
import { shopifyAdmin, ShopifyAuthError } from "@/lib/shopify/lhorlogemurale";
import { QUERY_SHOP_INFO } from "@/lib/shopify/queries";
import { initialFullSync } from "@/lib/shopify/sync";
import { getActiveShopifyIntegration, toLegacyIntegration } from "@/lib/shopify/integration";

const GABRIEL_USER_ID = "ef7a948f-2fab-41da-a5aa-a9f0b558adf0";

const SCOPES = [
  "read_orders", "read_all_orders", "read_products", "read_product_listings",
  "read_customers", "read_inventory", "read_locations", "read_analytics",
  "read_reports", "read_fulfillments", "read_shipping", "read_marketing_events",
  "read_publications", "read_price_rules", "read_discounts", "read_checkouts",
];

export async function POST() {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  if (auth.user.id !== GABRIEL_USER_ID) {
    return NextResponse.json({ error: "Réservé en V1" }, { status: 403 });
  }

  const shopDomain = process.env.SHOPIFY_LHORLOGEMURALE_SHOP_DOMAIN;
  const clientId = process.env.SHOPIFY_LHORLOGEMURALE_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_LHORLOGEMURALE_CLIENT_SECRET;
  const apiVersion = process.env.SHOPIFY_LHORLOGEMURALE_API_VERSION ?? "2025-01";

  if (!shopDomain || !clientId || !clientSecret) {
    return NextResponse.json({ error: "Env vars SHOPIFY_LHORLOGEMURALE_* manquantes" }, { status: 500 });
  }

  // 1. Vérif live
  let shopName = "L'Horloge Murale";
  try {
    const res = await shopifyAdmin<{ shop: { name: string; currencyCode: string; ianaTimezone: string } }>(
      QUERY_SHOP_INFO,
    );
    shopName = res.shop?.name ?? shopName;
  } catch (err) {
    if (err instanceof ShopifyAuthError) {
      return NextResponse.json({ error: "Credentials Shopify invalides" }, { status: 401 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  // 2. Upsert intégration
  const supabase = createAdminClient();
  const secretEncrypted = encryptToString(clientSecret);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integration, error } = await (supabase.from("integrations") as any)
    .upsert(
      {
        user_id: GABRIEL_USER_ID,
        provider: "shopify",
        shop_domain: shopDomain,
        secret_encrypted: secretEncrypted,
        scopes: SCOPES,
        status: "active",
        last_error: null,
        metadata: {
          auth: "client_credentials",
          client_id: clientId,
          api_version: apiVersion,
          shop_name: shopName,
        },
      },
      { onConflict: "user_id,provider,shop_domain" },
    )
    .select("id")
    .single();

  if (error || !integration) {
    return NextResponse.json({ error: error?.message ?? "Échec persistance" }, { status: 500 });
  }

  // 3. Initial sync en background
  fireAndForgetSync(auth.user.id).catch((e) => {
    console.error("[ecom/seed-lhorloge] initial sync failed:", e);
  });

  return NextResponse.json({
    ok: true,
    integration_id: integration.id,
    shop: { name: shopName, domain: shopDomain },
  });
}

async function fireAndForgetSync(userId: string) {
  const integration = await getActiveShopifyIntegration(userId);
  if (!integration) return;
  await initialFullSync(toLegacyIntegration(integration));
}

/**
 * POST /api/integrations/shopify/connect
 * Body : { shop_domain, client_id, client_secret, api_version? }
 *
 * V1 finale : modèle client_credentials.
 * On valide les creds en mintant un token + une query shop, puis on persiste
 * le client_secret chiffré (AES-256-GCM) dans `integrations`.
 *
 * Le token 24h n'est pas stocké : refresh à la demande par lib/shopify/admin.ts.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptToString } from "@/lib/encryption";
import { shopifyAdmin, ShopifyAuthError } from "@/lib/shopify/admin";
import { QUERY_SHOP_INFO } from "@/lib/shopify/queries";
import { initialFullSync } from "@/lib/shopify/sync";
import { z } from "zod";

const Body = z.object({
  shop_domain: z.string().regex(/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i),
  client_id: z.string().regex(/^[a-f0-9]{32}$/i),
  client_secret: z.string().regex(/^shpss_[a-f0-9]{32,}$/i),
  api_version: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Body invalide" }, { status: 400 });
  }

  const { shop_domain, client_id, client_secret, api_version = "2025-01" } = parsed.data;

  // 1. Tester le mint + une query shop pour valider les creds
  let shopName = "";
  try {
    const res = await shopifyAdmin<{ shop: { name: string; currencyCode: string; ianaTimezone: string } }>(
      QUERY_SHOP_INFO,
      undefined,
      { shopDomain: shop_domain, clientId: client_id, clientSecret: client_secret, apiVersion: api_version },
    );
    shopName = res.shop?.name ?? "";
  } catch (err) {
    if (err instanceof ShopifyAuthError) {
      return NextResponse.json({ error: "Credentials Shopify invalides" }, { status: 401 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  // 2. Chiffrer le client_secret + persister
  const supabase = createAdminClient();
  const secretEncrypted = encryptToString(client_secret);
  const metadata = {
    auth: "client_credentials" as const,
    client_id,
    api_version,
    shop_name: shopName,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integration, error } = await (supabase.from("integrations") as any)
    .upsert(
      {
        user_id: auth.user.id,
        provider: "shopify",
        shop_domain,
        secret_encrypted: secretEncrypted,
        status: "active",
        last_error: null,
        metadata,
      },
      { onConflict: "user_id,provider,shop_domain" },
    )
    .select("id")
    .single();

  if (error || !integration) {
    return NextResponse.json({ error: error?.message ?? "Échec persistance" }, { status: 500 });
  }

  // 3. Initial sync fire-and-forget — résolu par integration_id (multi-boutiques :
  // ne PAS passer par getActiveShopifyIntegration sans id, sinon la 2e boutique
  // ne démarrerait jamais sa sync initiale quand une 1re est déjà active).
  fireAndForgetInitialSync(auth.user.id, integration.id).catch((e) => {
    console.error("[ecom/connect] initial sync failed:", e);
  });

  return NextResponse.json({
    ok: true,
    integration_id: integration.id,
    shop: { name: shopName },
  });
}

async function fireAndForgetInitialSync(userId: string, integrationId: string) {
  const { getActiveShopifyIntegration } = await import("@/lib/shopify/integration");
  const integration = await getActiveShopifyIntegration(userId, integrationId);
  if (!integration) return;
  await initialFullSync({
    id: integration.id,
    user_id: integration.user_id,
    shop_domain: integration.shop_domain,
    access_token: "", // ignoré — sync.ts utilise ShopifyClient → shopifyAdmin (helper)
    webhook_secret: null,
    scopes: integration.scopes,
    shop_override: {
      shopDomain: integration.shop_domain,
      clientId: integration.client_id,
      clientSecret: integration.client_secret,
      apiVersion: integration.api_version,
    },
  });
}

/**
 * POST /api/integrations/shopify/connect
 * Body : { shop_domain, access_token, webhook_secret? }
 * Crée ou met à jour l'intégration, déclenche l'initial sync en background.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { encrypt, hexToBytea } from "@/lib/encryption";
import { ShopifyClient, ShopifyAuthError } from "@/lib/shopify/client";
import { QUERY_SHOP_INFO } from "@/lib/shopify/queries";
import { initialFullSync } from "@/lib/shopify/sync";
import { z } from "zod";

const Body = z.object({
  shop_domain: z.string().regex(/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i),
  access_token: z.string().regex(/^shpat_[a-f0-9]{32,}$/i),
  webhook_secret: z.string().min(8).optional(),
});

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Body invalide" }, { status: 400 });
  }

  const { shop_domain, access_token, webhook_secret } = parsed.data;

  // 1. Vérif connectivité + récup scopes (via header X-Shopify-Access-Token : le token réel)
  let shopInfo: { name: string; currencyCode: string; ianaTimezone: string } | null = null;
  try {
    const client = new ShopifyClient({
      id: "test", user_id: auth.user.id, shop_domain,
      access_token, webhook_secret: null, scopes: [],
    });
    const res = await client.request<{ shop: { name: string; currencyCode: string; ianaTimezone: string } }>(QUERY_SHOP_INFO);
    shopInfo = res.shop;
  } catch (err) {
    if (err instanceof ShopifyAuthError) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  // 2. Chiffrer le token + persister
  const supabase = createAdminClient();
  const enc = encrypt(access_token);
  const wsEnc = webhook_secret ? encrypt(webhook_secret) : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: integration, error } = await (supabase.from("integrations") as any)
    .upsert({
      user_id: auth.user.id,
      provider: "shopify",
      shop_domain,
      access_token_encrypted: hexToBytea(enc.ciphertext),
      access_token_nonce: hexToBytea(enc.nonce),
      webhook_secret_encrypted: wsEnc ? hexToBytea(wsEnc.ciphertext) : null,
      webhook_secret_nonce: wsEnc ? hexToBytea(wsEnc.nonce) : null,
      status: "active",
      last_error: null,
      metadata: { shop_name: shopInfo?.name, currency: shopInfo?.currencyCode, timezone: shopInfo?.ianaTimezone },
    }, { onConflict: "user_id,provider,shop_domain" })
    .select("id")
    .single();

  if (error || !integration) {
    return NextResponse.json({ error: error?.message ?? "Échec persistance" }, { status: 500 });
  }

  // 3. Déclencher initial sync en background (non bloquant)
  // En V1 sans queue, on lance fire-and-forget. La progression se voit
  // via /api/integrations/shopify/sync-state.
  fireAndForgetInitialSync(auth.user.id, shop_domain).catch((e) => {
    console.error("[ecom/connect] initial sync failed:", e);
  });

  return NextResponse.json({ ok: true, integration_id: integration.id, shop: shopInfo });
}

async function fireAndForgetInitialSync(userId: string, shopDomain: string) {
  const { getActiveShopifyIntegration } = await import("@/lib/shopify/integration");
  const integration = await getActiveShopifyIntegration(userId);
  if (!integration || integration.shop_domain !== shopDomain) return;
  await initialFullSync(integration);
}

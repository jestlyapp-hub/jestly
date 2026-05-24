/**
 * POST /api/integrations/shopify/test
 * Body : { shop_domain, access_token }
 * Vérifie la connectivité Shopify (shop info) + retourne les scopes accordés.
 * NE persiste rien.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { ShopifyClient, ShopifyAuthError } from "@/lib/shopify/client";
import { QUERY_SHOP_INFO } from "@/lib/shopify/queries";
import { z } from "zod";

const Body = z.object({
  shop_domain: z.string().regex(/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i, "Format domaine invalide"),
  access_token: z.string().regex(/^shpat_[a-f0-9]{32,}$/i, "Format token invalide"),
});

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Body invalide" }, { status: 400 });
  }

  const { shop_domain, access_token } = parsed.data;
  const client = new ShopifyClient({
    id: "test",
    user_id: auth.user.id,
    shop_domain,
    access_token,
    webhook_secret: null,
    scopes: [],
  });

  try {
    const res = await client.request<{ shop: {
      id: string; name: string; myshopifyDomain: string;
      primaryDomain: { host: string; url: string };
      currencyCode: string;
      email: string;
      contactEmail: string;
      ianaTimezone: string;
      plan: { displayName: string };
    } }>(QUERY_SHOP_INFO);
    return NextResponse.json({
      ok: true,
      shop: {
        id: res.shop.id,
        name: res.shop.name,
        myshopifyDomain: res.shop.myshopifyDomain,
        primaryDomain: res.shop.primaryDomain?.host,
        currency: res.shop.currencyCode,
        email: res.shop.email,
        timezone: res.shop.ianaTimezone,
        plan: res.shop.plan?.displayName,
      },
    });
  } catch (err) {
    if (err instanceof ShopifyAuthError) {
      return NextResponse.json({ ok: false, error: "Token invalide ou révoqué" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

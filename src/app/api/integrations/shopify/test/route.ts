/**
 * POST /api/integrations/shopify/test
 * Body : { shop_domain, client_id, client_secret, api_version? }
 *
 * V1 finale : valide la connectivité en mintant un token via client_credentials
 * puis en exécutant `{ shop { name } }`. NE persiste rien.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { shopifyAdmin, ShopifyAuthError } from "@/lib/shopify/lhorlogemurale";
import { QUERY_SHOP_INFO } from "@/lib/shopify/queries";
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

  try {
    const res = await shopifyAdmin<{
      shop: {
        id: string; name: string; myshopifyDomain: string;
        primaryDomain: { host: string; url: string };
        currencyCode: string;
        email: string;
        ianaTimezone: string;
        plan: { displayName: string };
      };
    }>(QUERY_SHOP_INFO, undefined, {
      shopDomain: shop_domain,
      clientId: client_id,
      clientSecret: client_secret,
      apiVersion: api_version,
    });
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
      return NextResponse.json({ ok: false, error: "Credentials invalides" }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

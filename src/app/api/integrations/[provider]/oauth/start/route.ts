/**
 * GET /api/integrations/[provider]/oauth/start
 * Démarre le flow OAuth d'un provider Ads (google | pinterest) et redirige
 * l'user vers l'écran d'autorisation. Shopify a son propre flow (client_credentials).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { oauthManager, OAuthError } from "@/lib/oauth/manager";
import type { OAuthProvider } from "@/lib/oauth/types";

const SUPPORTED: OAuthProvider[] = ["google", "pinterest"];

export async function GET(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  if (!SUPPORTED.includes(provider as OAuthProvider)) {
    return NextResponse.json({ error: `Provider OAuth non supporté: ${provider}` }, { status: 400 });
  }

  const auth = await getAuthUser();
  if (auth.error) return auth.error;

  const redirectTo = new URL(req.url).searchParams.get("redirect_to") ?? undefined;
  try {
    const url = await oauthManager.startFlow(provider as OAuthProvider, auth.user.id, redirectTo);
    return NextResponse.redirect(url);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: e instanceof OAuthError ? 400 : 500 });
  }
}

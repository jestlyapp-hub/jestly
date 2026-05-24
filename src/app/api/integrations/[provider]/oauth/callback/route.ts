/**
 * GET /api/integrations/[provider]/oauth/callback?code=...&state=...
 * Reçoit le retour OAuth, échange le code, persiste l'intégration, puis redirige
 * vers le hub /ecom/integrations (Phase 5). La sélection de compte (ad account /
 * customer id) sera gérée par les pages provider en Phase 2/3.
 */
import { NextRequest, NextResponse } from "next/server";
import { oauthManager } from "@/lib/oauth/manager";
import type { OAuthProvider } from "@/lib/oauth/types";

const SUPPORTED: OAuthProvider[] = ["google", "pinterest"];

function redirectTo(req: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, req.url));
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  if (!SUPPORTED.includes(provider as OAuthProvider)) {
    return NextResponse.json({ error: `Provider OAuth non supporté: ${provider}` }, { status: 400 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const providerError = url.searchParams.get("error");

  if (providerError) {
    return redirectTo(req, `/ecom/integrations?error=${encodeURIComponent(providerError)}&provider=${provider}`);
  }
  if (!code || !state) {
    return redirectTo(req, `/ecom/integrations?error=missing_code_or_state&provider=${provider}`);
  }

  try {
    const { integrationId } = await oauthManager.handleCallback(provider as OAuthProvider, code, state);
    // Phase 2/3 : rediriger vers select-account si le provider l'exige.
    return redirectTo(req, `/ecom/integrations?connected=${provider}&integration_id=${integrationId}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "callback_failed";
    return redirectTo(req, `/ecom/integrations?error=${encodeURIComponent(msg)}&provider=${provider}`);
  }
}

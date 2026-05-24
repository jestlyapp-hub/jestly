/**
 * Config OAuth Pinterest Business (API v5).
 * L'échange de token exige une auth Basic (client_id:client_secret en header).
 */
import type { OAuthConfig } from "./types";

const PINTEREST_SCOPES = ["ads:read", "pins:read", "boards:read", "user_accounts:read", "catalogs:read"];

export function getPinterestOAuthConfig(): OAuthConfig {
  const clientId = process.env.JESTLY_PINTEREST_APP_ID;
  const clientSecret = process.env.JESTLY_PINTEREST_APP_SECRET;
  const redirectUri =
    process.env.JESTLY_PINTEREST_REDIRECT_URI ??
    "http://localhost:3000/api/integrations/pinterest/oauth/callback";

  if (!clientId || !clientSecret) {
    throw new Error("Pinterest OAuth non configuré (JESTLY_PINTEREST_APP_ID / _SECRET manquants)");
  }

  return {
    provider: "pinterest",
    clientId,
    clientSecret,
    redirectUri,
    authUrl: "https://www.pinterest.com/oauth/",
    tokenUrl: "https://api.pinterest.com/v5/oauth/token",
    scopes: PINTEREST_SCOPES,
    tokenAuthStyle: "basic",
    scopeSeparator: ",",
    // Garantit des refresh tokens renouvelables indéfiniment (60j glissants).
    // Auto pour les apps récentes ; explicite pour les plus anciennes.
    tokenParams: { continuous_refresh: "true" },
  };
}

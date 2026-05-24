/**
 * Config OAuth Google (pour Google Ads). Scopes : adwords + email + profile.
 * access_type=offline + prompt=consent pour garantir un refresh_token.
 */
import type { OAuthConfig } from "./types";

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/adwords",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export function getGoogleOAuthConfig(): OAuthConfig {
  const clientId = process.env.JESTLY_GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.JESTLY_GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri =
    process.env.JESTLY_GOOGLE_OAUTH_REDIRECT_URI ??
    "http://localhost:3000/api/integrations/google/oauth/callback";

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth non configuré (JESTLY_GOOGLE_OAUTH_CLIENT_ID / _SECRET manquants)");
  }

  return {
    provider: "google",
    clientId,
    clientSecret,
    redirectUri,
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: GOOGLE_SCOPES,
    tokenAuthStyle: "body",
    scopeSeparator: " ",
    authParams: { access_type: "offline", prompt: "consent", include_granted_scopes: "true" },
  };
}

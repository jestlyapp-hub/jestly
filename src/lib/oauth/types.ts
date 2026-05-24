/**
 * Types partagés du flow OAuth multi-provider (Pinterest, Google Ads, …).
 * Voir src/lib/oauth/manager.ts pour l'orchestration.
 */
export type OAuthProvider = "shopify" | "google" | "pinterest";

export interface OAuthConfig {
  provider: OAuthProvider;
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  redirectUri: string;
  /** Échange de token : "body" (Google, creds dans le corps) ou "basic" (Pinterest, header Basic). */
  tokenAuthStyle: "body" | "basic";
  /** Séparateur des scopes dans l'URL d'autorisation. */
  scopeSeparator: " " | ",";
  /** Params additionnels pour l'URL d'autorisation (ex: Google access_type=offline). */
  authParams?: Record<string, string>;
  /** Params additionnels pour les requêtes token (ex: Pinterest continuous_refresh=true). */
  tokenParams?: Record<string, string>;
}

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type?: string;
}

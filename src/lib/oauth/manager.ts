/**
 * OAuthManager — orchestration OAuth multi-provider (multi-tenant).
 *
 * - startFlow : crée un state CSRF en DB + renvoie l'URL d'autorisation du provider.
 * - handleCallback : valide le state, échange le code, persiste les tokens chiffrés
 *   dans `integrations` (un row par user+provider).
 * - getValidAccessToken : renvoie un access_token valide, refresh auto si expiré
 *   (cache module-level par integration_id + mutex anti-course sur le refresh).
 * - refresh / revoke.
 *
 * Tokens TOUJOURS chiffrés via lib/encryption (AES-256-GCM). Server-side only.
 */
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptToString, decryptFromString } from "@/lib/encryption";
import { logger } from "@/lib/logger";
import type { OAuthConfig, OAuthProvider, OAuthTokens } from "./types";
import { getGoogleOAuthConfig } from "./google";
import { getPinterestOAuthConfig } from "./pinterest";

export class OAuthError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "OAuthError";
  }
}

const TOKEN_SAFETY_MARGIN_S = 120;

export function getOAuthConfig(provider: OAuthProvider): OAuthConfig {
  switch (provider) {
    case "google":
      return getGoogleOAuthConfig();
    case "pinterest":
      return getPinterestOAuthConfig();
    default:
      throw new OAuthError(`Provider OAuth non supporté: ${provider}`);
  }
}

export function buildAuthUrl(config: OAuthConfig, state: string): string {
  const u = new URL(config.authUrl);
  u.searchParams.set("client_id", config.clientId);
  u.searchParams.set("redirect_uri", config.redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", config.scopes.join(config.scopeSeparator));
  u.searchParams.set("state", state);
  for (const [k, v] of Object.entries(config.authParams ?? {})) u.searchParams.set(k, v);
  return u.toString();
}

/** Échange un code d'autorisation contre des tokens. Testable (fetch only). */
export async function exchangeCodeForTokens(config: OAuthConfig, code: string): Promise<OAuthTokens> {
  return tokenRequest(config, { grant_type: "authorization_code", code, redirect_uri: config.redirectUri });
}

/** Rafraîchit un access_token via le refresh_token. Testable (fetch only). */
export async function refreshTokens(config: OAuthConfig, refreshToken: string): Promise<OAuthTokens> {
  return tokenRequest(config, { grant_type: "refresh_token", refresh_token: refreshToken });
}

async function tokenRequest(config: OAuthConfig, params: Record<string, string>): Promise<OAuthTokens> {
  const body = new URLSearchParams(params);
  for (const [k, v] of Object.entries(config.tokenParams ?? {})) body.set(k, v);
  const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
  if (config.tokenAuthStyle === "basic") {
    headers["Authorization"] =
      "Basic " + Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  } else {
    body.set("client_id", config.clientId);
    body.set("client_secret", config.clientSecret);
  }
  const res = await fetch(config.tokenUrl, { method: "POST", headers, body });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new OAuthError(`Échange token ${config.provider} échoué: ${res.status} ${txt.slice(0, 160)}`, res.status);
  }
  const j = (await res.json()) as OAuthTokens;
  if (!j.access_token) throw new OAuthError(`Réponse token ${config.provider} sans access_token`);
  return j;
}

// ── Cache token + mutex refresh (par integration_id) ─────────────
interface CachedToken { token: string; exp: number }
const tokenCache = new Map<string, CachedToken>();
const refreshInflight = new Map<string, Promise<string>>();

export function clearOAuthTokenCache(integrationId?: string): void {
  if (integrationId) {
    tokenCache.delete(integrationId);
    refreshInflight.delete(integrationId);
  } else {
    tokenCache.clear();
    refreshInflight.clear();
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IntegrationRow = any;

export class OAuthManager {
  /** Crée le state CSRF en DB et renvoie l'URL d'autorisation à laquelle rediriger l'user. */
  async startFlow(provider: OAuthProvider, userId: string, redirectTo?: string): Promise<string> {
    const config = getOAuthConfig(provider);
    const state = randomUUID();
    const supabase = createAdminClient();
    const { error } = await (supabase.from("oauth_states") as IntegrationRow).insert({
      state,
      user_id: userId,
      provider,
      redirect_to: redirectTo ?? null,
    });
    if (error) throw new OAuthError(`Création du state OAuth impossible: ${error.message}`);
    logger.info("oauth_flow_start", { provider, userId });
    return buildAuthUrl(config, state);
  }

  /** Valide le state, échange le code, persiste les tokens chiffrés. */
  async handleCallback(provider: OAuthProvider, code: string, state: string): Promise<{ integrationId: string }> {
    const supabase = createAdminClient();
    const { data: row } = await (supabase.from("oauth_states") as IntegrationRow)
      .select("*").eq("state", state).maybeSingle();

    if (!row) throw new OAuthError("State OAuth invalide ou inconnu");
    if (row.provider !== provider) throw new OAuthError("State OAuth : provider mismatch");
    if (new Date(row.expires_at).getTime() < Date.now()) {
      await (supabase.from("oauth_states") as IntegrationRow).delete().eq("state", state);
      throw new OAuthError("State OAuth expiré");
    }
    // Consomme le state (usage unique)
    await (supabase.from("oauth_states") as IntegrationRow).delete().eq("state", state);

    const config = getOAuthConfig(provider);
    const tokens = await exchangeCodeForTokens(config, code);

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    const payload: Record<string, unknown> = {
      user_id: row.user_id,
      provider,
      status: "active",
      last_error: null,
      oauth_access_token_encrypted: encryptToString(tokens.access_token),
      oauth_token_expires_at: expiresAt,
      metadata: { scope: tokens.scope ?? config.scopes.join(",") },
    };
    if (tokens.refresh_token) payload.oauth_refresh_token_encrypted = encryptToString(tokens.refresh_token);

    // Un seul row par (user, provider) pour les providers Ads (shop_domain null
    // n'est pas dédupliqué par l'unique constraint) → upsert manuel.
    const { data: existing } = await (supabase.from("integrations") as IntegrationRow)
      .select("id").eq("user_id", row.user_id).eq("provider", provider).maybeSingle();

    let integrationId: string;
    if (existing) {
      const { error } = await (supabase.from("integrations") as IntegrationRow).update(payload).eq("id", existing.id);
      if (error) throw new OAuthError(`Mise à jour integration échouée: ${error.message}`);
      integrationId = existing.id;
    } else {
      const { data, error } = await (supabase.from("integrations") as IntegrationRow)
        .insert(payload).select("id").single();
      if (error || !data) throw new OAuthError(`Insertion integration échouée: ${error?.message}`);
      integrationId = data.id;
    }
    clearOAuthTokenCache(integrationId);
    logger.info("oauth_flow_complete", { provider, integrationId });
    return { integrationId };
  }

  /** Renvoie un access_token valide (cache + refresh auto, mutex anti-course). */
  async getValidAccessToken(integrationId: string): Promise<string> {
    const cached = tokenCache.get(integrationId);
    if (cached && Date.now() < cached.exp) return cached.token;

    const inflight = refreshInflight.get(integrationId);
    if (inflight) return inflight;

    const p = this.loadOrRefresh(integrationId).finally(() => refreshInflight.delete(integrationId));
    refreshInflight.set(integrationId, p);
    return p;
  }

  private async loadOrRefresh(integrationId: string): Promise<string> {
    const supabase = createAdminClient();
    const { data: row } = await (supabase.from("integrations") as IntegrationRow)
      .select("*").eq("id", integrationId).maybeSingle();
    if (!row) throw new OAuthError("Integration introuvable");

    const expMs = row.oauth_token_expires_at ? new Date(row.oauth_token_expires_at).getTime() : 0;
    const safeExp = expMs - TOKEN_SAFETY_MARGIN_S * 1000;
    if (row.oauth_access_token_encrypted && Date.now() < safeExp) {
      const token = decryptFromString(row.oauth_access_token_encrypted);
      tokenCache.set(integrationId, { token, exp: safeExp });
      return token;
    }
    return this.doRefresh(integrationId, row);
  }

  /** Force un refresh (hors cache). */
  async refresh(integrationId: string): Promise<void> {
    const supabase = createAdminClient();
    const { data: row } = await (supabase.from("integrations") as IntegrationRow)
      .select("*").eq("id", integrationId).maybeSingle();
    if (!row) throw new OAuthError("Integration introuvable");
    await this.doRefresh(integrationId, row);
  }

  private async doRefresh(integrationId: string, row: IntegrationRow): Promise<string> {
    if (!row.oauth_refresh_token_encrypted) {
      throw new OAuthError("Aucun refresh token — reconnexion du provider requise");
    }
    const config = getOAuthConfig(row.provider);
    const refreshToken = decryptFromString(row.oauth_refresh_token_encrypted);
    const supabase = createAdminClient();

    let tokens: OAuthTokens;
    try {
      tokens = await refreshTokens(config, refreshToken);
    } catch (e) {
      await (supabase.from("integrations") as IntegrationRow)
        .update({ status: "error", last_error: (e as Error).message }).eq("id", integrationId);
      clearOAuthTokenCache(integrationId);
      throw e;
    }

    const expMs = Date.now() + tokens.expires_in * 1000;
    const update: Record<string, unknown> = {
      oauth_access_token_encrypted: encryptToString(tokens.access_token),
      oauth_token_expires_at: new Date(expMs).toISOString(),
      status: "active",
      last_error: null,
    };
    if (tokens.refresh_token) update.oauth_refresh_token_encrypted = encryptToString(tokens.refresh_token);
    await (supabase.from("integrations") as IntegrationRow).update(update).eq("id", integrationId);

    tokenCache.set(integrationId, { token: tokens.access_token, exp: expMs - TOKEN_SAFETY_MARGIN_S * 1000 });
    logger.info("oauth_token_refreshed", { integrationId, provider: row.provider });
    return tokens.access_token;
  }

  /** Déconnecte : efface les tokens et passe le statut à disconnected. */
  async revoke(integrationId: string): Promise<void> {
    const supabase = createAdminClient();
    await (supabase.from("integrations") as IntegrationRow).update({
      status: "disconnected",
      oauth_access_token_encrypted: null,
      oauth_refresh_token_encrypted: null,
      oauth_token_expires_at: null,
    }).eq("id", integrationId);
    clearOAuthTokenCache(integrationId);
  }
}

export const oauthManager = new OAuthManager();

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// ── Mocks (hoisted shared state) ─────────────────────────────────
const h = vi.hoisted(() => ({
  oauthStateRow: null as Record<string, unknown> | null,
  integrationRow: null as Record<string, unknown> | null,
}));

vi.mock("@/lib/supabase/admin", () => {
  function makeBuilder(table: string) {
    const res =
      table === "oauth_states" ? { data: h.oauthStateRow, error: null }
      : table === "integrations" ? { data: h.integrationRow, error: null }
      : { data: null, error: null };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const builder: any = {
      select: () => builder,
      insert: () => builder,
      update: () => builder,
      delete: () => builder,
      eq: () => builder,
      maybeSingle: () => Promise.resolve(res),
      single: () => Promise.resolve({ data: { id: "new-int-id" }, error: null }),
      then: (resolve: (v: unknown) => void) => resolve({ error: null }),
    };
    return builder;
  }
  return { createAdminClient: () => ({ from: (t: string) => makeBuilder(t) }) };
});

vi.mock("@/lib/encryption", () => ({
  encryptToString: (s: string) => `enc(${s})`,
  decryptFromString: (s: string) => s.replace(/^enc\(/, "").replace(/\)$/, ""),
}));

vi.mock("@/lib/logger", () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

import {
  buildAuthUrl, exchangeCodeForTokens, refreshTokens, getOAuthConfig,
  OAuthManager, OAuthError, clearOAuthTokenCache,
} from "@/lib/oauth/manager";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

beforeEach(() => {
  process.env.JESTLY_GOOGLE_OAUTH_CLIENT_ID = "gid";
  process.env.JESTLY_GOOGLE_OAUTH_CLIENT_SECRET = "gsec";
  process.env.JESTLY_PINTEREST_APP_ID = "pid";
  process.env.JESTLY_PINTEREST_APP_SECRET = "psec";
  h.oauthStateRow = null;
  h.integrationRow = null;
  clearOAuthTokenCache();
});
afterEach(() => vi.restoreAllMocks());

describe("buildAuthUrl", () => {
  it("google: scope space-separated + access_type=offline + state", () => {
    const url = new URL(buildAuthUrl(getOAuthConfig("google"), "st8"));
    expect(url.searchParams.get("client_id")).toBe("gid");
    expect(url.searchParams.get("state")).toBe("st8");
    expect(url.searchParams.get("access_type")).toBe("offline");
    expect(url.searchParams.get("scope")).toContain("adwords");
    expect(url.searchParams.get("scope")).toContain(" "); // space-separated
  });

  it("pinterest: scope comma-separated", () => {
    const url = new URL(buildAuthUrl(getOAuthConfig("pinterest"), "st9"));
    expect(url.searchParams.get("scope")).toContain("ads:read,");
  });
});

describe("exchangeCodeForTokens", () => {
  it("returns tokens on success", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce(jsonResponse({ access_token: "at", refresh_token: "rt", expires_in: 3600 }));
    const t = await exchangeCodeForTokens(getOAuthConfig("google"), "code123");
    expect(t.access_token).toBe("at");
    expect(t.refresh_token).toBe("rt");
  });

  it("throws OAuthError on non-2xx", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce(new Response("bad", { status: 400 }));
    await expect(exchangeCodeForTokens(getOAuthConfig("google"), "x")).rejects.toThrow(OAuthError);
  });
});

describe("token request auth style", () => {
  it("pinterest uses Basic auth header", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({ access_token: "at", expires_in: 3600 }));
    global.fetch = fetchMock;
    await refreshTokens(getOAuthConfig("pinterest"), "rt");
    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Record<string, string>)["Authorization"]).toMatch(/^Basic /);
  });

  it("google puts client creds in body (no Basic header)", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({ access_token: "at", expires_in: 3600 }));
    global.fetch = fetchMock;
    await refreshTokens(getOAuthConfig("google"), "rt");
    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Record<string, string>)["Authorization"]).toBeUndefined();
    expect(String(init.body)).toContain("client_secret=gsec");
  });
});

describe("OAuthManager.getValidAccessToken — refresh mutex", () => {
  it("5 parallel calls on an expired token trigger a single refresh", async () => {
    h.integrationRow = {
      id: "int-1", provider: "google",
      oauth_access_token_encrypted: "enc(oldtoken)",
      oauth_refresh_token_encrypted: "enc(refreshtoken)",
      oauth_token_expires_at: new Date(Date.now() - 1000).toISOString(), // expiré
    };
    let resolveFetch: (r: Response) => void = () => {};
    const pending = new Promise<Response>((r) => { resolveFetch = r; });
    const fetchMock = vi.fn().mockReturnValueOnce(pending);
    global.fetch = fetchMock;

    const mgr = new OAuthManager();
    const calls = [0, 1, 2, 3, 4].map(() => mgr.getValidAccessToken("int-1"));
    resolveFetch(jsonResponse({ access_token: "freshtoken", expires_in: 3600 }));
    const results = await Promise.all(calls);

    expect(results.every((t) => t === "freshtoken")).toBe(true);
    expect(fetchMock.mock.calls.length).toBe(1);
  });
});

describe("OAuthManager.handleCallback — state validation", () => {
  it("throws on unknown state", async () => {
    h.oauthStateRow = null;
    await expect(new OAuthManager().handleCallback("google", "code", "nope")).rejects.toThrow(OAuthError);
  });

  it("throws on expired state", async () => {
    h.oauthStateRow = { provider: "google", user_id: "u1", expires_at: new Date(Date.now() - 1000).toISOString() };
    await expect(new OAuthManager().handleCallback("google", "code", "st")).rejects.toThrow(/expiré/);
  });
});

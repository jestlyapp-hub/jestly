import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getShopifyToken, clearShopifyTokenCache, ShopifyAuthError } from "@/lib/shopify/lhorlogemurale";

const OK = "shpat_test_token_value_24h_grant_response";

function mockFetchOnce(response: Response) {
  (global as unknown as { fetch: unknown }).fetch = vi.fn().mockResolvedValueOnce(response);
}

function mockFetchSeries(responses: Response[]) {
  const fn = vi.fn();
  (global as unknown as { fetch: unknown }).fetch = fn;
  for (const r of responses) fn.mockResolvedValueOnce(r);
}
void mockFetchSeries;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("getShopifyToken (client_credentials)", () => {
  const override = {
    shopDomain: "test-shop.myshopify.com",
    clientId: "0123456789abcdef0123456789abcdef",
    clientSecret: "shpss_test_secret_value_for_unit_tests",
    apiVersion: "2025-01",
  };

  beforeEach(() => {
    clearShopifyTokenCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mint a fresh token on first call", async () => {
    mockFetchOnce(jsonResponse({ access_token: OK, expires_in: 86399, scope: "read_orders" }));
    const token = await getShopifyToken(override);
    expect(token).toBe(OK);
  });

  it("reuses cached token on second call before expiration", async () => {
    mockFetchOnce(jsonResponse({ access_token: OK, expires_in: 86399 }));
    const a = await getShopifyToken(override);
    const b = await getShopifyToken(override);
    expect(a).toBe(OK);
    expect(b).toBe(OK);
    // Une seule fois fetch appelée
    expect((global.fetch as unknown as { mock: { calls: unknown[] } }).mock.calls.length).toBe(1);
  });

  it("throws ShopifyAuthError on 401", async () => {
    mockFetchOnce(new Response("Unauthorized", { status: 401 }));
    await expect(getShopifyToken(override)).rejects.toThrow(ShopifyAuthError);
  });

  it("parallel calls share the inflight promise (single mint)", async () => {
    let resolveFn: (r: Response) => void = () => {};
    const pending = new Promise<Response>((res) => { resolveFn = res; });
    (global as unknown as { fetch: unknown }).fetch = vi.fn().mockReturnValueOnce(pending);

    const p1 = getShopifyToken(override);
    const p2 = getShopifyToken(override);
    resolveFn(jsonResponse({ access_token: OK, expires_in: 86399 }));
    const [a, b] = await Promise.all([p1, p2]);
    expect(a).toBe(OK);
    expect(b).toBe(OK);
    expect((global.fetch as unknown as { mock: { calls: unknown[] } }).mock.calls.length).toBe(1);
  });
});

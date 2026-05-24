import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { pinterestApi, pinterestCollectAll, PinterestApiError } from "@/lib/pinterest/client";

vi.mock("@/lib/oauth/manager", () => ({
  oauthManager: {
    getValidAccessToken: vi.fn().mockResolvedValue("test_token"),
    refresh: vi.fn().mockResolvedValue(undefined),
  },
}));

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
}

function mockFetchSeries(responses: Response[]) {
  const fn = vi.fn();
  (global as unknown as { fetch: unknown }).fetch = fn;
  for (const r of responses) fn.mockResolvedValueOnce(r);
  return fn;
}

const integration = { id: "test-integration-id" };

describe("pinterestApi", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.restoreAllMocks());

  it("succès simple GET", async () => {
    mockFetchSeries([jsonResponse({ id: "abc", name: "Test" })]);
    const data = await pinterestApi<{ id: string; name: string }>(integration, "/ad_accounts/123");
    expect(data.id).toBe("abc");
  });

  it("retry sur 429 puis succès", async () => {
    const fetchMock = mockFetchSeries([
      new Response("Rate limit", { status: 429, headers: { "Retry-After": "0" } }),
      jsonResponse({ items: [] }),
    ]);
    const data = await pinterestApi(integration, "/ad_accounts");
    expect(data).toEqual({ items: [] });
    expect(fetchMock.mock.calls.length).toBe(2);
  });

  it("retry sur 502 puis succès", async () => {
    mockFetchSeries([
      new Response("Bad gateway", { status: 502 }),
      jsonResponse({ ok: true }),
    ]);
    const data = await pinterestApi(integration, "/test");
    expect(data).toEqual({ ok: true });
  });

  it("401 → refresh + retry une fois", async () => {
    const fetchMock = mockFetchSeries([
      new Response("Unauthorized", { status: 401 }),
      jsonResponse({ ok: true }),
    ]);
    const data = await pinterestApi(integration, "/test");
    expect(data).toEqual({ ok: true });
    expect(fetchMock.mock.calls.length).toBe(2);
  });

  it("401 après refresh → throw PinterestApiError 401", async () => {
    mockFetchSeries([
      new Response("Unauthorized", { status: 401 }),
      new Response("Unauthorized", { status: 401 }),
    ]);
    await expect(pinterestApi(integration, "/test")).rejects.toThrow(PinterestApiError);
  });

  it("400 → throw immédiat sans retry", async () => {
    const fetchMock = mockFetchSeries([
      new Response("Bad request", { status: 400 }),
    ]);
    await expect(pinterestApi(integration, "/test")).rejects.toThrow(PinterestApiError);
    expect(fetchMock.mock.calls.length).toBe(1);
  });

  it("query string : array → repeat keys", async () => {
    const fetchMock = mockFetchSeries([jsonResponse({ items: [] })]);
    await pinterestApi(integration, "/x", { query: { ids: ["a", "b", "c"], page_size: 25 } });
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("ids=a");
    expect(url).toContain("ids=b");
    expect(url).toContain("ids=c");
    expect(url).toContain("page_size=25");
  });
});

describe("pinterestCollectAll (cursor pagination via bookmark)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("pagine sur 3 pages puis stop quand bookmark absent", async () => {
    mockFetchSeries([
      jsonResponse({ items: [{ id: 1 }, { id: 2 }], bookmark: "abc" }),
      jsonResponse({ items: [{ id: 3 }], bookmark: "def" }),
      jsonResponse({ items: [{ id: 4 }] }),
    ]);
    const all = await pinterestCollectAll<{ id: number }>(integration, "/items");
    expect(all).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
  });

  it("1 seule page sans bookmark → 1 fetch", async () => {
    const fetchMock = mockFetchSeries([jsonResponse({ items: [{ id: 1 }] })]);
    const all = await pinterestCollectAll(integration, "/items");
    expect(all.length).toBe(1);
    expect(fetchMock.mock.calls.length).toBe(1);
  });
});

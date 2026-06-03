import { describe, it, expect } from "vitest";
import { attributeOrder, distributeCents, sortTouchpoints } from "@/lib/attribution/engine";
import type { Touchpoint } from "@/lib/attribution/types";

function tp(occurred_at: string, channel: string): Touchpoint {
  return { channel, campaign_id: null, campaign_name: null, occurred_at, source: null };
}

describe("distributeCents", () => {
  it("somme exacte = total même avec arrondis", () => {
    const out = distributeCents(10000, [1 / 3, 1 / 3, 1 / 3]);
    expect(out.reduce((s, v) => s + v, 0)).toBe(10000);
    // Le reste va aux plus grandes fractions.
    expect(out).toEqual([3334, 3333, 3333]);
  });
  it("poids nuls → tout au dernier", () => {
    const out = distributeCents(5000, [0, 0, 0]);
    expect(out).toEqual([0, 0, 5000]);
  });
  it("liste vide → []", () => expect(distributeCents(5000, [])).toEqual([]));
  it("1 poids → tout dessus", () => expect(distributeCents(999, [1])).toEqual([999]));
});

describe("sortTouchpoints", () => {
  it("trie par date croissante", () => {
    const sorted = sortTouchpoints([
      tp("2026-01-03T00:00:00Z", "c"),
      tp("2026-01-01T00:00:00Z", "a"),
      tp("2026-01-02T00:00:00Z", "b"),
    ]);
    expect(sorted.map((t) => t.channel)).toEqual(["a", "b", "c"]);
  });
});

describe("attributeOrder", () => {
  it("last_click attribue tout au dernier canal", () => {
    const res = attributeOrder({
      model: "last_click",
      orderId: "o1",
      orderTotalCents: 10000,
      currency: "EUR",
      conversionAt: "2026-01-03T00:00:00Z",
      touchpoints: [
        tp("2026-01-01T00:00:00Z", "pinterest"),
        tp("2026-01-02T00:00:00Z", "google_ads"),
      ],
    });
    expect(res.attributed_channels).toEqual({ pinterest: 0, google_ads: 10000 });
    expect(res.touchpoints.reduce((s, t) => s + t.attributed_cents, 0)).toBe(10000);
  });

  it("linear agrège les centimes par canal", () => {
    const res = attributeOrder({
      model: "linear",
      orderId: "o2",
      orderTotalCents: 9000,
      currency: "EUR",
      conversionAt: "2026-01-03T00:00:00Z",
      touchpoints: [
        tp("2026-01-01T00:00:00Z", "pinterest"),
        tp("2026-01-02T00:00:00Z", "pinterest"),
        tp("2026-01-03T00:00:00Z", "email"),
      ],
    });
    expect(res.attributed_channels.pinterest).toBe(6000);
    expect(res.attributed_channels.email).toBe(3000);
  });

  it("aucun touchpoint → channels vide, somme nulle", () => {
    const res = attributeOrder({
      model: "linear",
      orderId: "o3",
      orderTotalCents: 5000,
      currency: "EUR",
      conversionAt: "2026-01-03T00:00:00Z",
      touchpoints: [],
    });
    expect(res.touchpoints).toEqual([]);
    expect(res.attributed_channels).toEqual({});
  });
});

import { describe, it, expect } from "vitest";
import { resolveSourceHierarchy, computeRepartition, type BoardOrderInput } from "@/lib/gads/attribution-board";
import { PpsPayloadSchema } from "@/lib/pixel/pps";

const base: BoardOrderInput = {
  total_cents: 5990,
  native_channel: null,
  manual: null,
  pixel: null,
  survey: null,
};

const pixel = (first: "google_ads" | "pinterest" | "seo" | "direct" | "other", last = first) =>
  ({ source_first: first, source_last: last, confidence: 0.95, match_method: "cart_attribute" });

describe("resolveSourceHierarchy — ordre strict des 5 niveaux", () => {
  it("1. le pixel prime sur tout, y compris le natif et le manuel", () => {
    const o: BoardOrderInput = {
      ...base,
      native_channel: "seo",
      manual: { channel: "other", confidence: "sure" },
      pixel: pixel("google_ads"),
      survey: "pinterest",
    };
    const r = resolveSourceHierarchy(o, "last");
    expect(r.origin).toBe("pixel");
    expect(r.channel).toBe("google_ads");
    expect(r.confidence).toBe(0.95);
  });

  it("2. natif Shopify quand pas de pixel", () => {
    const r = resolveSourceHierarchy({ ...base, native_channel: "seo", manual: { channel: "google_ads", confidence: "sure" } }, "last");
    expect(r.origin).toBe("native");
    expect(r.channel).toBe("seo");
  });

  it("3. manuel quand ni pixel ni natif ; un ghost manuel explicite force le niveau 5", () => {
    expect(resolveSourceHierarchy({ ...base, manual: { channel: "pinterest", confidence: "guessed" } }, "last"))
      .toMatchObject({ origin: "manual", channel: "pinterest", confidence: 0.3 });
    expect(resolveSourceHierarchy({ ...base, manual: { channel: "ghost", confidence: null }, survey: "google" }, "last"))
      .toMatchObject({ origin: "ghost", channel: null });
  });

  it("4. survey JAMAIS au-dessus du pixel, du natif ou du manuel", () => {
    // Seul → survey
    expect(resolveSourceHierarchy({ ...base, survey: "google" }, "last"))
      .toMatchObject({ origin: "survey", channel: "google_ads" });
    // Face au pixel → pixel gagne
    expect(resolveSourceHierarchy({ ...base, pixel: pixel("pinterest"), survey: "google" }, "last").origin).toBe("pixel");
    // Face au natif → natif gagne
    expect(resolveSourceHierarchy({ ...base, native_channel: "other", survey: "google" }, "last").origin).toBe("native");
    // Face au manuel → manuel gagne
    expect(resolveSourceHierarchy({ ...base, manual: { channel: "seo", confidence: "assumed" }, survey: "google" }, "last").origin).toBe("manual");
  });

  it("5. ghost quand rien", () => {
    expect(resolveSourceHierarchy(base, "last")).toMatchObject({ origin: "ghost", channel: null, confidence: null });
  });

  it("mapping des réponses survey vers les canaux", () => {
    expect(resolveSourceHierarchy({ ...base, survey: "pinterest" }, "last").channel).toBe("pinterest");
    expect(resolveSourceHierarchy({ ...base, survey: "instagram_tiktok" }, "last").channel).toBe("other");
    expect(resolveSourceHierarchy({ ...base, survey: "word_of_mouth" }, "last").channel).toBe("other");
  });
});

describe("first-click vs last-click — n'affecte que le pixel", () => {
  it("le toggle bascule la source pixel", () => {
    const o: BoardOrderInput = { ...base, pixel: pixel("google_ads", "pinterest") };
    expect(resolveSourceHierarchy(o, "first").channel).toBe("google_ads");
    expect(resolveSourceHierarchy(o, "last").channel).toBe("pinterest");
  });

  it("le natif est identique dans les deux modèles (first-touch seul disponible)", () => {
    const o: BoardOrderInput = { ...base, native_channel: "google_ads" };
    expect(resolveSourceHierarchy(o, "first")).toEqual(resolveSourceHierarchy(o, "last"));
  });
});

describe("computeRepartition — CA par canal selon le modèle", () => {
  it("répartit le CA et compte les origines", () => {
    const orders: BoardOrderInput[] = [
      { ...base, total_cents: 10000, native_channel: "google_ads" },
      { ...base, total_cents: 5000, pixel: pixel("google_ads") },
      { ...base, total_cents: 3000, survey: "word_of_mouth" },
      { ...base, total_cents: 2000 },
    ];
    const rows = computeRepartition(orders, "last");
    const gads = rows.find((r) => r.channel === "google_ads")!;
    expect(gads.revenue_cents).toBe(15000);
    expect(gads.by_origin).toEqual({ native: 1, pixel: 1 });
    expect(rows.find((r) => r.channel === "other")!.by_origin).toEqual({ survey: 1 });
    expect(rows.find((r) => r.channel === "ghost")!.orders).toBe(1);
    expect(gads.sample_small).toBe(true); // 2 ventes < 5
  });
});

describe("PpsPayloadSchema — endpoint public du survey", () => {
  it("accepte un payload valide", () => {
    expect(PpsPayloadSchema.safeParse({
      pixel_id: "97f155e4-4286-4c2d-932f-e935f6205a0b",
      order_id: "6234567890123",
      answer: "google",
    }).success).toBe(true);
  });

  it("rejette réponse inconnue, order_id non numérique, pixel_id invalide", () => {
    const valid = { pixel_id: "97f155e4-4286-4c2d-932f-e935f6205a0b", order_id: "123456", answer: "google" };
    expect(PpsPayloadSchema.safeParse({ ...valid, answer: "tiktok" }).success).toBe(false);
    expect(PpsPayloadSchema.safeParse({ ...valid, order_id: "abc'; DROP--" }).success).toBe(false);
    expect(PpsPayloadSchema.safeParse({ ...valid, pixel_id: "xyz" }).success).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { lastClickWeights } from "@/lib/attribution/models/last-click";
import { firstClickWeights } from "@/lib/attribution/models/first-click";
import { linearWeights } from "@/lib/attribution/models/linear";
import { timeDecayWeights } from "@/lib/attribution/models/time-decay";
import { positionBasedWeights } from "@/lib/attribution/models/position-based";
import type { Touchpoint } from "@/lib/attribution/types";

function tp(occurred_at: string, channel = "pinterest"): Touchpoint {
  return { channel, campaign_id: null, campaign_name: null, occurred_at, source: null };
}

const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);

describe("last_click", () => {
  it("100% au dernier touchpoint", () => {
    expect(lastClickWeights([tp("a"), tp("b"), tp("c")])).toEqual([0, 0, 1]);
  });
  it("liste vide → []", () => expect(lastClickWeights([])).toEqual([]));
  it("1 touchpoint → [1]", () => expect(lastClickWeights([tp("a")])).toEqual([1]));
});

describe("first_click", () => {
  it("100% au premier touchpoint", () => {
    expect(firstClickWeights([tp("a"), tp("b"), tp("c")])).toEqual([1, 0, 0]);
  });
  it("liste vide → []", () => expect(firstClickWeights([])).toEqual([]));
});

describe("linear", () => {
  it("répartition égale, somme = 1", () => {
    const w = linearWeights([tp("a"), tp("b"), tp("c"), tp("d")]);
    expect(w).toEqual([0.25, 0.25, 0.25, 0.25]);
    expect(sum(w)).toBeCloseTo(1);
  });
});

describe("position_based", () => {
  it("1 touchpoint → [1]", () => expect(positionBasedWeights([tp("a")])).toEqual([1]));
  it("2 touchpoints → [0.5, 0.5]", () =>
    expect(positionBasedWeights([tp("a"), tp("b")])).toEqual([0.5, 0.5]));
  it("3 touchpoints → 40/20/40", () => {
    const w = positionBasedWeights([tp("a"), tp("b"), tp("c")]);
    expect(w[0]).toBeCloseTo(0.4);
    expect(w[1]).toBeCloseTo(0.2);
    expect(w[2]).toBeCloseTo(0.4);
    expect(sum(w)).toBeCloseTo(1);
  });
  it("4 touchpoints → 40/10/10/40", () => {
    const w = positionBasedWeights([tp("a"), tp("b"), tp("c"), tp("d")]);
    expect(w).toEqual([0.4, 0.1, 0.1, 0.4]);
    expect(sum(w)).toBeCloseTo(1);
  });
});

describe("time_decay", () => {
  it("poids plus fort proche de la conversion, somme = 1", () => {
    const tps = [
      tp("2026-01-01T00:00:00Z"),
      tp("2026-01-08T00:00:00Z"), // demi-vie 7j → exactement la moitié du dernier
      tp("2026-01-15T00:00:00Z"),
    ];
    const w = timeDecayWeights(tps, "2026-01-15T00:00:00Z");
    expect(sum(w)).toBeCloseTo(1);
    expect(w[2]).toBeGreaterThan(w[1]!);
    expect(w[1]).toBeGreaterThan(w[0]!);
  });
  it("dates invalides → répartition égale", () => {
    const w = timeDecayWeights([tp("zzz"), tp("zzz")], "zzz");
    expect(w).toEqual([0.5, 0.5]);
  });
  it("demi-vie : un touch à H-7j pèse 2x moins que H-0", () => {
    const tps = [tp("2026-01-08T00:00:00Z"), tp("2026-01-15T00:00:00Z")];
    const w = timeDecayWeights(tps, "2026-01-15T00:00:00Z");
    expect(w[1]! / w[0]!).toBeCloseTo(2, 1);
  });
});

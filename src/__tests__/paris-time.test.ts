import { describe, it, expect } from "vitest";
import { parisDay, parisDayStartUtcIso, parisNextDayStartUtcIso } from "@/lib/paris-time";

describe("parisDay — regroupement par jour en Europe/Paris", () => {
  it("une commande à 00 h 30 heure de Paris appartient à SON jour, pas à la veille", () => {
    // 22:30 UTC le 5 juillet = 00:30 le 6 juillet à Paris (été, UTC+2)
    expect(parisDay("2026-07-05T22:30:00Z")).toBe("2026-07-06");
    // Alors que le jour UTC aurait dit le 5 (l'ancien bug)
    expect("2026-07-05T22:30:00Z".slice(0, 10)).toBe("2026-07-05");
  });

  it("gère l'heure d'hiver (UTC+1)", () => {
    // 23:30 UTC le 10 janvier = 00:30 le 11 janvier à Paris
    expect(parisDay("2026-01-10T23:30:00Z")).toBe("2026-01-11");
    // 22:30 UTC en hiver = 23:30 à Paris, même jour
    expect(parisDay("2026-01-10T22:30:00Z")).toBe("2026-01-10");
  });

  it("journée normale : inchangé", () => {
    expect(parisDay("2026-07-05T10:00:00Z")).toBe("2026-07-05");
  });
});

describe("bornes de plage en minuit de Paris", () => {
  it("minuit de Paris en été = 22:00 UTC la veille", () => {
    expect(parisDayStartUtcIso("2026-07-06")).toBe("2026-07-05T22:00:00.000Z");
    expect(parisNextDayStartUtcIso("2026-07-05")).toBe("2026-07-05T22:00:00.000Z");
  });

  it("minuit de Paris en hiver = 23:00 UTC la veille", () => {
    expect(parisDayStartUtcIso("2026-01-11")).toBe("2026-01-10T23:00:00.000Z");
  });
});

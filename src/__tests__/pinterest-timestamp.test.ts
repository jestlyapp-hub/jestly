import { describe, it, expect } from "vitest";

/**
 * Helper toIsoTimestamp dupliqué du sync.ts pour le tester en isolation.
 * (la fonction est interne, non exportée — duplication intentionnelle).
 */
function toIsoTimestamp(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (typeof v === "string" && v.includes("T")) return v;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const ms = n < 1e12 ? n * 1000 : n;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

describe("Pinterest toIsoTimestamp (campaign start_time/end_time)", () => {
  it("epoch secondes (number) → ISO", () => {
    // 1777536000 = 2026-04-30 00:00:00 UTC
    expect(toIsoTimestamp(1777536000)).toBe("2026-04-30T08:00:00.000Z");
  });

  it("epoch secondes (string numérique) → ISO", () => {
    expect(toIsoTimestamp("1777536000")).toBe("2026-04-30T08:00:00.000Z");
  });

  it("epoch millisecondes (number > 1e12) → ISO", () => {
    expect(toIsoTimestamp(1777536000000)).toBe("2026-04-30T08:00:00.000Z");
  });

  it("ISO string déjà formatée → renvoie telle quelle", () => {
    expect(toIsoTimestamp("2026-04-30T12:34:56.000Z")).toBe("2026-04-30T12:34:56.000Z");
  });

  it("null / undefined / empty string → null", () => {
    expect(toIsoTimestamp(null)).toBeNull();
    expect(toIsoTimestamp(undefined)).toBeNull();
    expect(toIsoTimestamp("")).toBeNull();
  });

  it("string non numérique → null (pas de crash)", () => {
    expect(toIsoTimestamp("abc")).toBeNull();
  });

  it("epoch 0 → 1970", () => {
    expect(toIsoTimestamp(0)).toBe("1970-01-01T00:00:00.000Z");
  });
});

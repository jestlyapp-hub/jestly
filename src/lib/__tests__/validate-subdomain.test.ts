import { describe, it, expect } from "vitest";
import { validateSubdomain, normalizeSubdomain } from "../validate-subdomain";

describe("normalizeSubdomain", () => {
  it("lowercases and trims", () => {
    expect(normalizeSubdomain("  MyShop  ")).toBe("myshop");
  });

  it("converts spaces to dashes", () => {
    expect(normalizeSubdomain("my shop name")).toBe("my-shop-name");
  });

  it("strips invalid characters", () => {
    expect(normalizeSubdomain("my_shop!@#")).toBe("myshop");
  });

  it("collapses consecutive dashes", () => {
    expect(normalizeSubdomain("my---shop")).toBe("my-shop");
  });

  it("strips leading/trailing dashes", () => {
    expect(normalizeSubdomain("-my-shop-")).toBe("my-shop");
  });
});

describe("validateSubdomain", () => {
  it("accepts valid subdomains", () => {
    expect(validateSubdomain("mon-site")).toEqual({ valid: true, normalized: "mon-site" });
    expect(validateSubdomain("abc")).toEqual({ valid: true, normalized: "abc" });
    expect(validateSubdomain("studio-42")).toEqual({ valid: true, normalized: "studio-42" });
  });

  it("rejects too short (< 3)", () => {
    const r = validateSubdomain("ab");
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.reason).toBe("too_short");
  });

  it("rejects too long (> 40)", () => {
    const r = validateSubdomain("a".repeat(41));
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.reason).toBe("too_long");
  });

  it("rejects reserved words", () => {
    for (const word of ["www", "api", "admin", "dashboard", "jestly", "auth"]) {
      const r = validateSubdomain(word);
      expect(r.valid).toBe(false);
      if (!r.valid) expect(r.reason).toBe("reserved");
    }
  });

  it("normalizes input before validating", () => {
    expect(validateSubdomain("  Mon Site  ")).toEqual({ valid: true, normalized: "mon-site" });
  });

  it("rejects empty after normalization", () => {
    const r = validateSubdomain("---");
    expect(r.valid).toBe(false);
  });

  it("accepts exactly 3 chars", () => {
    expect(validateSubdomain("abc")).toEqual({ valid: true, normalized: "abc" });
  });

  it("accepts exactly 40 chars", () => {
    const slug = "a" + "-b".repeat(19) + "c"; // 40 chars: a-b-b-b-b-b-b-b-b-b-b-b-b-b-b-b-b-b-b-bc
    // Let's use a simpler 40-char slug
    const s = "a".repeat(40);
    expect(validateSubdomain(s)).toEqual({ valid: true, normalized: s });
  });
});

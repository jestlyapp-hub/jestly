import { describe, it, expect } from "vitest";
import crypto from "node:crypto";

const secret = "shpss_test_secret_value_for_unit_tests";

function computeHmac(body: string): string {
  return crypto.createHmac("sha256", secret).update(body, "utf8").digest("base64");
}

function timingSafeCompare(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

describe("Shopify webhook HMAC verification", () => {
  const rawBody = JSON.stringify({ id: 12345, name: "#1010", total_price: "99.99" });

  it("computes valid HMAC for raw body", () => {
    const expected = computeHmac(rawBody);
    expect(expected).toMatch(/^[A-Za-z0-9+/]+=*$/); // base64
  });

  it("timing-safe compare returns true for matching", () => {
    const sig = computeHmac(rawBody);
    expect(timingSafeCompare(sig, sig)).toBe(true);
  });

  it("rejects modified body", () => {
    const sig = computeHmac(rawBody);
    const modified = rawBody.replace("12345", "99999");
    const sigModified = computeHmac(modified);
    expect(sigModified).not.toBe(sig);
    expect(timingSafeCompare(sig, sigModified)).toBe(false);
  });

  it("rejects different-length signatures", () => {
    const sig = computeHmac(rawBody);
    expect(timingSafeCompare(sig, sig + "x")).toBe(false);
  });

  it("rejects tampered signature", () => {
    const sig = computeHmac(rawBody);
    const tampered = sig.slice(0, -2) + "XX";
    expect(timingSafeCompare(sig, tampered)).toBe(false);
  });
});

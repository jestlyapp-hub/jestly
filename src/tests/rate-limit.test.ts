import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests within the limit", () => {
    const limiter = rateLimit("test-allow", 3, 60000);
    expect(limiter("127.0.0.1")).toBe(true);
    expect(limiter("127.0.0.1")).toBe(true);
    expect(limiter("127.0.0.1")).toBe(true);
  });

  it("blocks requests exceeding the limit", () => {
    const limiter = rateLimit("test-block", 2, 60000);
    expect(limiter("127.0.0.1")).toBe(true);
    expect(limiter("127.0.0.1")).toBe(true);
    expect(limiter("127.0.0.1")).toBe(false); // 3rd request blocked
  });

  it("resets after the time window", () => {
    const limiter = rateLimit("test-reset", 1, 1000);
    expect(limiter("127.0.0.1")).toBe(true);
    expect(limiter("127.0.0.1")).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(1001);

    expect(limiter("127.0.0.1")).toBe(true); // Should pass again
  });

  it("tracks different IPs independently", () => {
    const limiter = rateLimit("test-ips", 1, 60000);
    expect(limiter("192.168.0.1")).toBe(true);
    expect(limiter("192.168.0.2")).toBe(true);
    expect(limiter("192.168.0.1")).toBe(false); // IP 1 blocked
    expect(limiter("192.168.0.2")).toBe(false); // IP 2 blocked
  });
});

describe("getClientIp", () => {
  it("extracts IP from x-forwarded-for header", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("returns 'unknown' when no header", () => {
    const req = new Request("http://localhost");
    expect(getClientIp(req)).toBe("unknown");
  });
});

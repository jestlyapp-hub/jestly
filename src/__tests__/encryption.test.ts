import { describe, it, expect, beforeAll } from "vitest";
import { encryptToString, decryptFromString } from "@/lib/encryption";

beforeAll(() => {
  // Génère une clé de test si pas déjà en env
  if (!process.env.ENCRYPTION_KEY && !process.env.ENCRYPTION_MASTER_KEY) {
    process.env.ENCRYPTION_KEY = Buffer.from("0123456789abcdef0123456789abcdef").toString("base64");
  }
});

describe("encryption AES-256-GCM", () => {
  it("round-trip simple string", () => {
    const plaintext = "fake_secret_for_unit_tests_0123456789abcdef";
    const enc = encryptToString(plaintext);
    expect(enc).not.toContain(plaintext);
    const dec = decryptFromString(enc);
    expect(dec).toBe(plaintext);
  });

  it("each encryption produces a different ciphertext (random IV)", () => {
    const plaintext = "same input";
    const a = encryptToString(plaintext);
    const b = encryptToString(plaintext);
    expect(a).not.toBe(b);
    expect(decryptFromString(a)).toBe(plaintext);
    expect(decryptFromString(b)).toBe(plaintext);
  });

  it("handles unicode + special chars", () => {
    const plaintext = "L'Horloge Murale — ñ €€ 你好 🚀";
    expect(decryptFromString(encryptToString(plaintext))).toBe(plaintext);
  });

  it("throws on tampered ciphertext", () => {
    const enc = encryptToString("secret");
    const tampered = enc.slice(0, -4) + "XXXX";
    expect(() => decryptFromString(tampered)).toThrow();
  });

  it("throws on too-short input", () => {
    expect(() => decryptFromString("short")).toThrow();
  });
});

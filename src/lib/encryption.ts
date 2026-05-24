/**
 * Chiffrement applicatif AES-256-GCM pour les secrets d'intégrations.
 *
 * Format de sortie : base64(iv || authTag || ciphertext) — single string
 * stockable en colonne `text` Postgres. Évite pgsodium (déprécié par Supabase).
 *
 * Clé : ENCRYPTION_KEY (32 bytes en base64) en env, sinon dérivée de
 * ENCRYPTION_MASTER_KEY via scrypt (fallback compat). NE PAS exposer côté client.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const direct = process.env.ENCRYPTION_KEY;
  if (direct) {
    const buf = Buffer.from(direct, "base64");
    if (buf.length !== 32) {
      throw new Error(`ENCRYPTION_KEY must be 32 bytes (base64). Got ${buf.length}.`);
    }
    return buf;
  }
  const master = process.env.ENCRYPTION_MASTER_KEY;
  if (!master) {
    throw new Error("ENCRYPTION_KEY (base64) ou ENCRYPTION_MASTER_KEY manquant dans .env.local");
  }
  return scryptSync(master, "jestly-integrations-salt-v1", 32);
}

/**
 * Chiffre une string en AES-256-GCM.
 * Retourne une seule string base64 : iv (12) || tag (16) || ciphertext.
 */
export function encryptToString(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString("base64");
}

/** Déchiffre une string produite par `encryptToString`. */
export function decryptFromString(encoded: string): string {
  const key = getKey();
  const buf = Buffer.from(encoded, "base64");
  if (buf.length < IV_LENGTH + TAG_LENGTH + 1) {
    throw new Error("Invalid encrypted payload: too short");
  }
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ct = buf.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

// ── Legacy split-payload API (gardée pour compat phase 2) ────────
export interface EncryptedPayload {
  ciphertext: string;
  nonce: string;
}

export function encrypt(plaintext: string): EncryptedPayload {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([ct, tag]);
  return { ciphertext: combined.toString("hex"), nonce: iv.toString("hex") };
}

export function decrypt(payload: EncryptedPayload): string {
  const key = getKey();
  const iv = Buffer.from(payload.nonce, "hex");
  const combined = Buffer.from(payload.ciphertext, "hex");
  const ct = combined.subarray(0, combined.length - TAG_LENGTH);
  const tag = combined.subarray(combined.length - TAG_LENGTH);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

// ── Helpers bytea (legacy) ───────────────────────────────────────
export function bufferToHex(buf: Buffer | Uint8Array | string | null): string | null {
  if (!buf) return null;
  if (typeof buf === "string") {
    return buf.startsWith("\\x") ? buf.slice(2) : buf;
  }
  return Buffer.from(buf).toString("hex");
}

export function hexToBytea(hex: string): string {
  return "\\x" + hex;
}

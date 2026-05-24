/**
 * Encryption helper pour les tokens d'intégrations (Shopify, etc.).
 *
 * V1 : AES-256-GCM côté Node.js avec clé en env (ENCRYPTION_MASTER_KEY).
 * Plus simple à déployer que pgsodium pour démarrer ; on pourra migrer
 * vers pgsodium en V2 si besoin du chiffrement at-rest côté DB.
 *
 * NE JAMAIS appeler ces fonctions côté client. Toujours côté server only.
 */
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const masterKey = process.env.ENCRYPTION_MASTER_KEY;
  if (!masterKey) {
    throw new Error("ENCRYPTION_MASTER_KEY manquant dans .env.local");
  }
  return scryptSync(masterKey, "jestly-integrations-salt-v1", 32);
}

export interface EncryptedPayload {
  ciphertext: string;
  nonce: string;
}

/** Chiffre une string en AES-256-GCM. Retourne { ciphertext, nonce } en hex. */
export function encrypt(plaintext: string): EncryptedPayload {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([enc, tag]);
  return {
    ciphertext: combined.toString("hex"),
    nonce: iv.toString("hex"),
  };
}

/** Déchiffre un payload chiffré par `encrypt`. Throw si invalide. */
export function decrypt(payload: EncryptedPayload): string {
  const key = getKey();
  const iv = Buffer.from(payload.nonce, "hex");
  const combined = Buffer.from(payload.ciphertext, "hex");
  const enc = combined.subarray(0, combined.length - TAG_LENGTH);
  const tag = combined.subarray(combined.length - TAG_LENGTH);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

/** Helpers pour conversion bytea (Postgres) <-> hex string. */
export function bufferToHex(buf: Buffer | Uint8Array | string | null): string | null {
  if (!buf) return null;
  if (typeof buf === "string") {
    // Postgres bytea hex format : \x...
    return buf.startsWith("\\x") ? buf.slice(2) : buf;
  }
  return Buffer.from(buf).toString("hex");
}

export function hexToBytea(hex: string): string {
  return "\\x" + hex;
}

import crypto from "crypto";

/**
 * ==========================================================
 * ENTERPRISE CRYPTO LAYER (AES-256-GCM)
 * ==========================================================
 * - Confidentiality + Integrity (GCM mode)
 * - Safe key derivation
 * - Runtime-safe env validation
 */

const SECRET = process.env.APP_ENCRYPTION_SECRET;

if (!SECRET) {
  throw new Error("❌ APP_ENCRYPTION_SECRET is missing in .env");
}

/**
 * Derive a 32-byte key from secret (stable across restarts)
 */
const KEY = crypto.createHash("sha256").update(SECRET).digest();

/**
 * Encrypt (AES-256-GCM)
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12); // GCM standard IV size

  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  /**
   * Format:
   * iv:authTag:ciphertext
   */
  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

/**
 * Decrypt (AES-256-GCM)
 */
export function decrypt(payload: string): string {
  const [ivHex, authTagHex, encryptedHex] = payload.split(":");

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Invalid encrypted payload format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

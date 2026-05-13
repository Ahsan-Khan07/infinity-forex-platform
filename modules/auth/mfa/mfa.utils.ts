import speakeasy from "speakeasy";
import QRCode from "qrcode";

/**
 * Generate MFA secret
 */
export function generateMfaSecret(email: string) {
  return speakeasy.generateSecret({
    name: `InfinityFinance (${email})`,
    length: 32,
  });
}

/**
 * Generate QR Code
 */
export async function generateQrCode(otpauthUrl: string) {
  return await QRCode.toDataURL(otpauthUrl);
}

/**
 * Verify TOTP code
 */
export function verifyTotp(secret: string, token: string) {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2,
  });
}

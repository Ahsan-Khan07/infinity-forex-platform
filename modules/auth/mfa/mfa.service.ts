import { prisma } from "@/lib/prisma";
import { generateMfaSecret, verifyTotp } from "./mfa.utils";
import crypto from "crypto";

/**
 * Create MFA setup
 */
export async function setupMfa(userId: string, email: string) {
  const secret = generateMfaSecret(email);

  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaSecret: secret.base32,
      mfaEnabled: false,
    },
  });

  return {
    otpauthUrl: secret.otpauth_url!,
    base32: secret.base32,
  };
}

/**
 * Enable MFA after verification
 */
export async function enableMfa(userId: string, token: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user?.mfaSecret) throw new Error("MFA_NOT_SETUP");

  const valid = verifyTotp(user.mfaSecret, token);

  if (!valid) throw new Error("INVALID_CODE");

  // generate backup codes
  const backupCodes = Array.from({ length: 8 }).map(() =>
    crypto.randomBytes(4).toString("hex")
  );

  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaEnabled: true,
      mfaSetupRequired: false,
      mfaBackupCodes: backupCodes,
    },
  });

  return backupCodes;
}

/**
 * Verify MFA during login
 */
export async function verifyMfa(userId: string, token: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user?.mfaSecret) return false;

  return verifyTotp(user.mfaSecret, token);
}

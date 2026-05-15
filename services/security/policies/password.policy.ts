import { SecurityContext, SecurityResult } from "../types";

const weakPasswords = [
  "password123",
  "12345678",
  "qwerty123",
  "admin123",
  "welcome123",
];

export async function passwordPolicy(
  ctx: SecurityContext
): Promise<SecurityResult> {
  const payload = ctx.payload as { currentPassword?: string; newPassword?: string } | null | undefined;
  const { newPassword, currentPassword } = payload || {};

  if (!currentPassword || !newPassword) {
    return {
      decision: "BLOCK",
      riskScore: 100,
      reason: "MISSING_FIELDS",
    } satisfies SecurityResult;
  }

  if (weakPasswords.includes(newPassword.toLowerCase())) {
    return {
      decision: "BLOCK",
      riskScore: 95,
      reason: "COMMON_PASSWORD_NOT_ALLOWED",
    } satisfies SecurityResult;
  }

  if (newPassword.length < 10) {
    return {
      decision: "BLOCK",
      riskScore: 85,
      reason: "WEAK_PASSWORD",
    } satisfies SecurityResult;
  }

  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;

  if (!strongRegex.test(newPassword)) {
    return {
      decision: "BLOCK",
      riskScore: 90,
      reason: "PASSWORD_COMPLEXITY_FAILED",
    } satisfies SecurityResult;
  }

  return {
    decision: "ALLOW",
    riskScore: 0,
  } satisfies SecurityResult;
}
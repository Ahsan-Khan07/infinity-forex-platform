import { SecurityContext, SecurityResult } from "../types";

export async function emailPolicy(ctx: SecurityContext): Promise<SecurityResult> {
  const payload = ctx.payload as { email?: string } | null | undefined;
  const { email } = payload || {};

  if (!email) {
    return {
      decision: "BLOCK",
      riskScore: 100,
      reason: "MISSING_EMAIL",
    } satisfies SecurityResult;
  }

  const normalized = email.toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalized)) {
    return {
      decision: "BLOCK",
      riskScore: 90,
      reason: "INVALID_EMAIL",
    } satisfies SecurityResult;
  }

  // (optional hook: disposable email detection)
  const blockedDomains = ["tempmail.com", "mailinator.com"];

  if (blockedDomains.some((d) => normalized.includes(d))) {
    return {
      decision: "BLOCK",
      riskScore: 95,
      reason: "DISPOSABLE_EMAIL_NOT_ALLOWED",
    } satisfies SecurityResult;
  }

  return {
    decision: "ALLOW",
    riskScore: 10,
  } satisfies SecurityResult;
}
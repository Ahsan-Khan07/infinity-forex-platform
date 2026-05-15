import { SecurityContext } from "../types";

export async function calculateRiskScore(ctx: SecurityContext) {
  let score = 0;

  // IP based risk
  if (!ctx.ip) score += 20;

  // user agent missing = bot risk
  if (!ctx.userAgent) score += 20;

  // sensitive action
  if (ctx.action === "CHANGE_PASSWORD") score += 30;
  if (ctx.action === "CHANGE_EMAIL") score += 25;

  // optional: add geo/IP mismatch checks here
  // optional: device trust check

  return Math.min(score, 100);
}

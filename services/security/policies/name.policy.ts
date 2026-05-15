import { SecurityContext, SecurityResult } from "../types";

export async function namePolicy(ctx: SecurityContext): Promise<SecurityResult> {
  const payload = ctx.payload as { name?: string } | null | undefined;
  const { name } = payload || {};

  if (!name || typeof name !== "string") {
    return {
      decision: "BLOCK",
      riskScore: 100,
      reason: "INVALID_NAME",
    } satisfies SecurityResult;
  }

  if (name.length < 2 || name.length > 50) {
    return {
      decision: "BLOCK",
      riskScore: 70,
      reason: "NAME_LENGTH_INVALID",
    } satisfies SecurityResult;
  }

  const regex = /^[a-zA-Z\s.-]+$/;

  if (!regex.test(name)) {
    return {
      decision: "BLOCK",
      riskScore: 80,
      reason: "NAME_FORMAT_INVALID",
    } satisfies SecurityResult;
  }

  return {
    decision: "ALLOW",
    riskScore: 0,
  } satisfies SecurityResult;
}
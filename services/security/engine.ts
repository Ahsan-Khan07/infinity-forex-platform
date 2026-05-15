import { SecurityContext, SecurityResult } from "./types";
import { passwordPolicy } from "./policies/password.policy";
import { emailPolicy } from "./policies/email.policy";
import { namePolicy } from "./policies/name.policy";
import { mfaPolicy } from "./policies/mfa.policy";
import { calculateRiskScore } from "./risk/risk.engine";

export async function SecurityPolicyEngine(
  ctx: SecurityContext
): Promise<SecurityResult> {
  let policyResult: SecurityResult;

  switch (ctx.action) {
    case "CHANGE_PASSWORD":
      policyResult = await passwordPolicy(ctx);
      break;

    case "CHANGE_EMAIL":
      policyResult = await emailPolicy(ctx);
      break;

    case "CHANGE_NAME":
      policyResult = await namePolicy(ctx);
      break;

    case "ENABLE_MFA":
    case "DISABLE_MFA":
      policyResult = await mfaPolicy(ctx);
      break;

    default:
      return {
        decision: "BLOCK",
        riskScore: 100,
        reason: "UNKNOWN_ACTION",
      } satisfies SecurityResult;
  }

  if (policyResult.decision === "BLOCK") {
    return policyResult;
  }

  const riskScore = await calculateRiskScore(ctx);

  if (riskScore >= 80) {
    return {
      decision: "BLOCK",
      riskScore,
      reason: "HIGH_RISK_ACTIVITY",
    } satisfies SecurityResult;
  }

  if (riskScore >= 50) {
    return {
      decision: "MFA_REQUIRED",
      riskScore,
      reason: "STEP_UP_AUTH_REQUIRED",
    } satisfies SecurityResult;
  }

  return {
    decision: "ALLOW",
    riskScore,
  } satisfies SecurityResult;
}
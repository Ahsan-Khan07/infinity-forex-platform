import { SecurityContext, SecurityResult } from "../types";

export async function mfaPolicy(ctx: SecurityContext): Promise<SecurityResult> {
  // MFA operations always allowed but risk evaluated externally
  return {
    decision: "ALLOW",
    riskScore: 20,
  } satisfies SecurityResult;
}
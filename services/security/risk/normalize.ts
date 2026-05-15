import { NextRequest, NextResponse } from "next/server";
import { SecurityPolicyEngine } from "@/services/security/engine";

export interface SecurityCheckResult {
  allowed: boolean;
  mfaRequired?: boolean;
  error?: string;
  riskScore?: number;
}

export async function checkSecurity(
  request: NextRequest,
  userId: string,
  action: Parameters<typeof SecurityPolicyEngine>[0]["action"],
  payload?: unknown
): Promise<SecurityCheckResult> {
  const result = await SecurityPolicyEngine({
    userId,
    action,
    ip: request.headers.get("x-forwarded-for") || undefined,
    userAgent: request.headers.get("user-agent") || undefined,
    payload,
  });

  if (result.decision === "BLOCK") {
    return {
      allowed: false,
      error: result.reason,
      riskScore: result.riskScore,
    };
  }

  if (result.decision === "MFA_REQUIRED") {
    return {
      allowed: false,
      mfaRequired: true,
      error: result.reason,
      riskScore: result.riskScore,
    };
  }

  return {
    allowed: true,
    riskScore: result.riskScore,
  };
}
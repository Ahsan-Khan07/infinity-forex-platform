export type SecurityAction =
  | "CHANGE_PASSWORD"
  | "CHANGE_EMAIL"
  | "CHANGE_NAME"
  | "ENABLE_MFA"
  | "DISABLE_MFA";

export type SecurityDecision =
  | "ALLOW"
  | "BLOCK"
  | "MFA_REQUIRED"
  | "REVIEW";

export interface SecurityContext {
  userId: string;
  email?: string;
  ip?: string | null;
  userAgent?: string | null;
  action: SecurityAction;
  payload?: unknown;
}

export interface SecurityResult {
  decision: SecurityDecision;
  reason?: string;
  riskScore: number;
}
/**
 * FRAUD ENGINE TYPES
 * -------------------
 * Defines risk scoring structure used across login pipeline
 */

export interface FraudContext {
  userId?: string;
  email?: string;
  ip: string;
  userAgent: string;
  fingerprint?: string;

  loginAttempts?: number;
  previousFailures?: number;
  isNewDevice?: boolean;
}

export interface FraudScoreResult {
  score: number;
  reasons: string[];
  action: "ALLOW" | "STEP_UP" | "BLOCK";
}

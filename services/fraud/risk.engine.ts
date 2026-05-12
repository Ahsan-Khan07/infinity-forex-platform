/**
 * FRAUD RISK ENGINE (CORE SYSTEM)
 * --------------------------------
 * Aggregates all signals into a final risk score.
 *
 * This is the HEART of your login security system.
 */

import { FraudContext, FraudScoreResult } from "./fraud.types";
import { getIpRiskScore } from "./ip.reputation";
import { calculateVelocityRisk } from "./login.velocity";
import { detectAnomalies } from "./anomaly.detector";

export function calculateFraudRisk(context: FraudContext): FraudScoreResult {
  let score = 0;
  const reasons: string[] = [];

  // -----------------------------
  // IP RISK
  // -----------------------------
  const ipRisk = getIpRiskScore(context.ip);
  score += ipRisk;

  if (ipRisk > 0) reasons.push("Suspicious IP detected");

  // -----------------------------
  // LOGIN VELOCITY
  // -----------------------------
  const velocityRisk = calculateVelocityRisk(
    context.loginAttempts ?? 0
  );
  score += velocityRisk;

  if (velocityRisk > 0) reasons.push("High login attempt velocity");

  // -----------------------------
  // ANOMALY DETECTION
  // -----------------------------
  const anomalyRisk = detectAnomalies({
    isNewDevice: context.isNewDevice,
    previousFailures: context.previousFailures,
  });

  score += anomalyRisk;

  if (anomalyRisk > 0) reasons.push("Behavioral anomaly detected");

  // -----------------------------
  // FINAL DECISION
  // -----------------------------
  let action: FraudScoreResult["action"] = "ALLOW";

  if (score >= 70) action = "BLOCK";
  else if (score >= 40) action = "STEP_UP";

  return {
    score: Math.min(score, 100),
    reasons,
    action,
  };
}

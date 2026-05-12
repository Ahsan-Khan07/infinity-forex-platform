/**
 * LOGIN VELOCITY DETECTOR
 * -----------------------
 * Detects brute-force or rapid login attempts
 */

export function calculateVelocityRisk(attempts: number = 0): number {
  if (attempts <= 3) return 0;
  if (attempts <= 5) return 20;
  if (attempts <= 10) return 50;
  return 80;
}

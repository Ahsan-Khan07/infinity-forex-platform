/**
 * ANOMALY DETECTOR
 * -----------------
 * Detects suspicious login behavior patterns
 */

export function detectAnomalies({
  isNewDevice,
  previousFailures = 0,
}: {
  isNewDevice?: boolean;
  previousFailures?: number;
}): number {
  let score = 0;

  if (isNewDevice) score += 25;

  if (previousFailures > 3) score += 30;
  if (previousFailures > 7) score += 50;

  return score;
}

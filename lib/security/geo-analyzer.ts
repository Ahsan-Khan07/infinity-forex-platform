/**
 * GEO ANOMALY DETECTOR
 * --------------------
 * Detects suspicious login location changes.
 *
 * Example:
 * - Pakistan → USA in 2 minutes = HIGH RISK
 */

export function detectGeoAnomaly({
  previousCountry,
  currentCountry,
}: {
  previousCountry?: string;
  currentCountry?: string;
}) {
  if (!previousCountry || !currentCountry) {
    return { risk: "LOW" };
  }

  if (previousCountry !== currentCountry) {
    return {
      risk: "HIGH",
      reason: "LOCATION_JUMP",
    };
  }

  return { risk: "LOW" };
}

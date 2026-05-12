/**
 * IP REPUTATION MODULE
 * --------------------
 * Lightweight rule-based IP scoring system.
 * (Can later be replaced with MaxMind / IPQS API)
 */

const suspiciousIPRanges = [
  "10.", // internal testing spoof (example rule)
  "172.16.",
];

export function getIpRiskScore(ip: string): number {
  let score = 0;

  // Example heuristic rules
  if (suspiciousIPRanges.some((range) => ip.startsWith(range))) {
    score += 30;
  }

  // Loopback / localhost detection
  if (ip === "127.0.0.1" || ip === "::1") {
    score += 10;
  }

  return score;
}

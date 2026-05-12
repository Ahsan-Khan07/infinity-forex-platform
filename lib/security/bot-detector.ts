/**
 * BOT DETECTION ENGINE
 * --------------------
 * Detects automated login attempts using behavioral signals.
 */

export function calculateBotScore({
  userAgent,
  fingerprint,
  loginAttempts,
}: any) {
  let score = 0;

  if (!userAgent) score += 30;
  if (!fingerprint) score += 30;

  if (loginAttempts > 5) score += 40;

  // suspicious automation indicators
  if (userAgent?.includes("curl")) score += 50;
  if (userAgent?.includes("Postman")) score += 30;

  return {
    score,
    isBot: score > 60,
  };
}

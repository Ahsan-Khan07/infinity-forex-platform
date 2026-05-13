// Simple in-memory rate limiter (production-ready baseline)
// NOTE:
// - Works fine for single-server deployments
// - For real SaaS production (multi-server), replace with Redis-based limiter

const rateMap = new Map<string, { count: number; lastReset: number }>();

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60 * 1000
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();

  const record = rateMap.get(key);

  // First request OR window expired
  if (!record || now - record.lastReset > windowMs) {
    rateMap.set(key, { count: 1, lastReset: now });

    return {
      allowed: true,
      remaining: limit - 1,
      resetInMs: windowMs,
    };
  }

  // Rate limit exceeded
  if (record.count >= limit) {
    const resetInMs = windowMs - (now - record.lastReset);

    return {
      allowed: false,
      remaining: 0,
      resetInMs: resetInMs > 0 ? resetInMs : 0,
    };
  }

  // Increment request count
  record.count += 1;

  const resetInMs = windowMs - (now - record.lastReset);

  return {
    allowed: true,
    remaining: limit - record.count,
    resetInMs: resetInMs > 0 ? resetInMs : 0,
  };
}

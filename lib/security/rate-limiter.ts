/**
 * DISTRIBUTED RATE LIMITING ENGINE (ENTERPRISE)
 * ---------------------------------------------
 * Prevents brute force, credential stuffing, and API abuse.
 *
 * NOTE:
 * In production, replace in-memory Map with Redis.
 */

const memoryStore = new Map<string, { count: number; expires: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const LIMIT = 10;

export function checkRateLimit(key: string) {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || record.expires < now) {
    memoryStore.set(key, {
      count: 1,
      expires: now + WINDOW_MS,
    });
    return { allowed: true };
  }

  record.count += 1;

  if (record.count > LIMIT) {
    return {
      allowed: false,
      retryAfter: record.expires - now,
    };
  }

  return { allowed: true };
}

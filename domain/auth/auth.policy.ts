/**
 * AUTH DOMAIN POLICY (BUSINESS RULES)
 * ------------------------------------
 * Pure business logic ONLY.
 * No database, no Next.js, no APIs.
 */

export function canUserLogin(user: any) {
  if (!user) return false;

  if (user.lockUntil && user.lockUntil > new Date()) {
    return false;
  }

  if (!user.emailVerified) {
    return false;
  }

  return true;
}

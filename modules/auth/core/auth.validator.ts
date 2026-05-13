/**
 * AUTH VALIDATION LAYER
 * ----------------------
 * Centralized input validation before business logic execution.
 */

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidAuthInput(email: string, password: string): boolean {
  if (!email || !password) return false;
  if (email.length < 5) return false;
  if (password.length < 6) return false;
  return true;
}

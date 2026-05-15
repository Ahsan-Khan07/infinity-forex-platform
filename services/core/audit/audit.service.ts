import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * AUDIT ACTION TYPES (FINTECH EVENT MODEL)
 */
export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "DEVICE_VERIFIED"
  | "NEW_DEVICE_DETECTED"
  | "PASSWORD_CHANGED"
  | "EMAIL_CHANGED"
  | "MFA_ENABLED"
  | "MFA_DISABLED"
  | "MFA_SETUP_STARTED"
  | "PROFILE_UPDATED"
  | "LOGOUT";

/**
 * AUDIT INPUT CONTRACT
 */
interface AuditLogInput {
  userId?: string;
  action: AuditAction;
  ip?: string | null;
  userAgent?: string | null;

  /**
   * Prisma-safe JSON payload
   */
  metadata?: Prisma.InputJsonValue;
}

/**
 * FINTECH-GRADE AUDIT SERVICE
 * ---------------------------
 * - Never breaks auth flow
 * - Always Prisma JSON safe
 * - Structured event logging
 * - Defensive fallback handling
 */
export async function auditLog({
  userId,
  action,
  ip,
  userAgent,
  metadata,
}: AuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ?? null,
        action,

        ip: ip ?? null,
        userAgent: userAgent ?? null,

        /**
         * FIXED:
         * Prisma expects JSON object, NOT string
         * Always fallback to empty object
         */
        metadata: metadata ?? {},
      },
    });
  } catch (error) {
    /**
     * CRITICAL:
     * Audit failures must NEVER block business logic
     */
    console.error("AUDIT_LOG_ERROR:", error);
  }
}

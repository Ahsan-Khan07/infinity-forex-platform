/**
 * AUDIT SERVICE (ENTERPRISE LOGGING LAYER)
 * ----------------------------------------
 * Centralized security & activity logging system.
 *
 * Used for:
 * - login tracking
 * - security events
 * - fraud detection signals
 * - admin audit trails
 */

import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "DEVICE_VERIFIED"
  | "NEW_DEVICE_DETECTED"
  | "PASSWORD_CHANGED"
  | "EMAIL_CHANGED";

interface AuditLogInput {
  userId?: string;
  action: AuditAction;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export async function auditLog({
  userId,
  action,
  ip,
  userAgent,
  metadata,
}: AuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: userId ?? null,
        action,
        ip: ip ?? null,
        userAgent: userAgent ?? null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    // Never break auth flow due to logging failure
    console.error("AUDIT_LOG_ERROR:", error);
  }
}

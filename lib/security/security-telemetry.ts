/**
 * SECURITY TELEMETRY ENGINE
 * -------------------------
 * Sends security events to audit system.
 */

import { auditLog } from "@/services/audit/audit.service";

export async function emitSecurityEvent({
  userId,
  action,
  ip,
  userAgent,
  metadata,
}: any) {
  await auditLog({
    userId,
    action,
    ip,
    userAgent,
    metadata,
  });
}

/**
 * SESSION SERVICE (ENTERPRISE CONTROL LAYER)
 * ------------------------------------------
 * Handles:
 * - session versioning
 * - global logout mechanism
 * - session validation
 */

import { prisma } from "@/lib/prisma";

/**
 * Increment sessionVersion → invalidates ALL active sessions
 * (used for logout all devices or password change)
 */
export async function invalidateAllSessions(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      sessionVersion: {
        increment: 1,
      },
    },
  });
}

/**
 * Validate session is still active
 */
export async function isSessionValid(user: any, tokenVersion: number) {
  return user.sessionVersion === tokenVersion;
}

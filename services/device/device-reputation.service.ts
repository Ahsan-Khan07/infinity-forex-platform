/**
 * DEVICE REPUTATION SERVICE (FRAUD PREVENTION LAYER)
 * ---------------------------------------------------
 * Tracks trust score of devices over time.
 */

import { prisma } from "@/lib/prisma";

export async function updateDeviceReputation({
  userId,
  fingerprint,
  success,
}: any) {
  const device = await prisma.trustedDevice.findFirst({
    where: { userId, fingerprint },
  });

  if (!device) return;

  const newScore = success
    ? (device.trustScore ?? 0) + 1
    : (device.trustScore ?? 0) - 2;

  return prisma.trustedDevice.update({
    where: { id: device.id },
    data: {
      trustScore: newScore,
      lastSeenAt: new Date(),
    },
  });
}

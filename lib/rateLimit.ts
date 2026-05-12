import { prisma } from "@/lib/prisma";

export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const now = new Date();

  const existing = await prisma.rateLimit.findUnique({
    where: { key },
  });

  if (!existing) {
    await prisma.rateLimit.create({
      data: {
        key,
        count: 1,
        expiresAt: new Date(now.getTime() + windowSeconds * 1000),
      },
    });

    return { allowed: true, remaining: limit - 1 };
  }

  // reset window if expired
  if (existing.expiresAt < now) {
    await prisma.rateLimit.update({
      where: { key },
      data: {
        count: 1,
        expiresAt: new Date(now.getTime() + windowSeconds * 1000),
      },
    });

    return { allowed: true, remaining: limit - 1 };
  }

  // limit exceeded
  if (existing.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  // increment usage
  const updated = await prisma.rateLimit.update({
    where: { key },
    data: {
      count: { increment: 1 },
    },
  });

  return { allowed: true, remaining: limit - updated.count };
}

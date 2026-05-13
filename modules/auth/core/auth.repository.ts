/**
 * AUTH REPOSITORY
 * ----------------
 * Handles ONLY database operations.
 * No business logic allowed here.
 */

import { prisma } from "@/lib/prisma";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

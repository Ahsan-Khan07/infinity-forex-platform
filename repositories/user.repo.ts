/**
 * USER REPOSITORY (DATA ACCESS LAYER)
 * -----------------------------------
 * This layer isolates ALL database operations.
 * No business logic allowed here.
 */

import { prisma } from "@/lib/prisma";

export const userRepo = {
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  resetLoginState: async (email: string) => {
    return prisma.user.update({
      where: { email },
      data: {
        failedLoginAttempts: 0,
        lockUntil: null,
        lastLoginAt: new Date(),
      },
    });
  },
};

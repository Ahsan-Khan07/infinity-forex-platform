import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * LOGIN SERVICE
 * -------------
 * Validates email + password and returns a safe user payload
 * used by NextAuth Credentials Provider.
 */
export async function loginService(email: string, password: string) {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return null;
  }

  // Block suspended users
  if (user.status === "SUSPENDED" || user.status === "BLOCKED") {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    sessionVersion: user.sessionVersion,
  };
}

/**
 * AUTH SERVICE (BUSINESS LOGIC LAYER)
 * ------------------------------------
 * Handles login validation + security rules
 */

import bcrypt from "bcryptjs";
import { findUserByEmail } from "./auth.repository";
import { normalizeEmail, isValidAuthInput } from "./auth.validator";
import { AuthResult } from "./auth.types";
import { Role } from "@prisma/client";

export async function loginService(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    // 1. Validate input
    if (!isValidAuthInput(email, password)) {
      return { success: false, error: "Invalid input" };
    }

    const normalizedEmail = normalizeEmail(email);

    // 2. Fetch user
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // 3. SECURITY CHECK (RESTORED FROM PRISMA)
    if (user.status === "SUSPENDED" || user.status === "BLOCKED") {
      return { success: false, error: "Account restricted" };
    }

    if (!user.isVerified) {
      return { success: false, error: "Email not verified" };
    }

    // 4. Password check
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, error: "Invalid credentials" };
    }

    // 5. SUCCESS RESPONSE (NO PASSWORD LEAK)
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role as Role,
        sessionVersion: user.sessionVersion,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "Internal authentication error",
    };
  }
}

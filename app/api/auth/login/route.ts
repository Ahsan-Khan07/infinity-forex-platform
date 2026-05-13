import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * LOGIN API (PRODUCTION GRADE)
 * - validates input
 * - checks user state
 * - verifies password
 * - returns safe session data
 */

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // ─────────────────────────────
    // 1. BASIC VALIDATION
    // ─────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Missing credentials" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // ─────────────────────────────
    // 2. FETCH USER
    // ─────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ─────────────────────────────
    // 3. SECURITY CHECKS
    // ─────────────────────────────
    if (user.status === "SUSPENDED" || user.status === "BLOCKED") {
      return NextResponse.json(
        { success: false, error: "Account restricted" },
        { status: 403 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { success: false, error: "Email not verified" },
        { status: 403 }
      );
    }

    // ─────────────────────────────
    // 4. PASSWORD CHECK
    // ─────────────────────────────
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ─────────────────────────────
    // 5. SUCCESS RESPONSE (NO PASSWORD LEAK)
    // ─────────────────────────────
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        sessionVersion: user.sessionVersion,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

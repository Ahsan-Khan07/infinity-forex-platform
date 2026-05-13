import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail } from "@/modules/notifications/core/mailer";
import { rateLimit } from "@/modules/auth/core/security";

/**
 * REGISTER API (PRODUCTION GRADE)
 * - rate limited
 * - secure password hashing
 * - email verification flow
 * - no sensitive leaks
 */

export async function POST(req: Request) {
  try {
    // ─────────────────────────────────────────
    // 1. IP BASED RATE LIMITING
    // ─────────────────────────────────────────
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const limit = await rateLimit(`REGISTER_${ip}`, 5, 60);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    // ─────────────────────────────────────────
    // 2. INPUT PARSING
    // ─────────────────────────────────────────
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // ─────────────────────────────────────────
    // 3. VALIDATION
    // ─────────────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const strongPassword =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password);

    if (!strongPassword) {
      return NextResponse.json(
        { error: "Weak password (A-Z, a-z, 0-9, 8+ chars)" },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────
    // 4. DUPLICATE CHECK
    // ─────────────────────────────────────────
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Account already exists" },
        { status: 400 }
      );
    }

    // ─────────────────────────────────────────
    // 5. CREATE USER
    // ─────────────────────────────────────────
    const verifyToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: await hashPassword(password),
        isVerified: false,
        verifyToken,
        verifyTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    // ─────────────────────────────────────────
    // 6. SEND EMAIL
    // ─────────────────────────────────────────
    await sendVerificationEmail(cleanEmail, verifyToken, cleanName);

    // ─────────────────────────────────────────
    // 7. RESPONSE
    // ─────────────────────────────────────────
    return NextResponse.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

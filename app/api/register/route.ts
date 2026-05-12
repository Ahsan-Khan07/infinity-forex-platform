import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // ✅ RATE LIMIT (REGISTER PROTECTION)
    const limitCheck = await rateLimit(`REGISTER_${ip}`, 5, 60); // 5 requests / 60 sec

    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait 1 minute and try again." },
        { status: 429 }
      );
    }

    const { name, email, password } = await req.json();

    // 🔴 BASIC VALIDATION
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // 🔐 SERVER EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // 🔐 PASSWORD POLICY (FINTECH GRADE)
    const strongPassword =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password);

    if (!strongPassword) {
      return NextResponse.json(
        {
          error:
            "Weak password. Use 8+ chars with uppercase, lowercase & number",
        },
        { status: 400 }
      );
    }

    // 🔴 CHECK EXISTING USER
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Account already exists. Please login or use forgot password.",
        },
        { status: 400 }
      );
    }

    // 🔐 TOKEN GENERATION
    const verifyToken = crypto.randomBytes(32).toString("hex");

    // 🔴 CREATE USER
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

    // 📧 EMAIL VERIFICATION
    await sendVerificationEmail(cleanEmail, verifyToken, cleanName);

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}

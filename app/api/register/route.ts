import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // 🔴 VALIDATION (IMPORTANT)
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // 🔴 CHECK EXISTING USER
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // 🔐 VERIFY TOKEN (NEW)
    const verifyToken = crypto.randomBytes(32).toString("hex");

    // 🔴 CREATE USER
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: await hashPassword(password),

        // ⚠️ EMAIL VERIFICATION FLOW
        isVerified: false,
        verifyToken,
        verifyTokenExpiry: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      },
    });

    // 📧 SEND EMAIL (RESEND FIXED)
    await sendVerificationEmail(cleanEmail, verifyToken, name.trim());

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

  } catch (error: any) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}

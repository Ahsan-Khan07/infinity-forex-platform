import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: "User already verified" },
        { status: 400 }
      );
    }

    const verifyToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { email: cleanEmail },
      data: {
        verifyToken,
        verifyTokenExpiry: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    await sendVerificationEmail(cleanEmail, verifyToken, user.name);

    return NextResponse.json({
      success: true,
      message: "Verification email resent",
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

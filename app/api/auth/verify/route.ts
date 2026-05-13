import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { welcomeEmailTemplate } from "@/modules/notifications/core/email/templates/welcome-email";
import { resend } from "@/modules/notifications/core/resend";

/**
 * EMAIL VERIFICATION ENDPOINT (PRODUCTION GRADE)
 * ------------------------------------------------
 * Responsibilities:
 * 1. Validate verification token
 * 2. Enforce expiry rules
 * 3. Prevent replay attacks (atomic update)
 * 4. Activate user account
 * 5. Send welcome email (non-blocking)
 * 6. Redirect user to success page
 *
 * Security:
 * - Single-use token
 * - Expiry enforced at DB + query level
 * - No user enumeration leaks
 * - Replay-safe atomic update
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    // --------------------------------------------------
    // 1. VALIDATION (FAST FAIL)
    // --------------------------------------------------
    if (!token || token.length < 20) {
      return NextResponse.json(
        { error: "Invalid verification link" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 2. FIND USER BY TOKEN
    // --------------------------------------------------
    const user = await prisma.user.findFirst({
      where: { verifyToken: token },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        verifyToken: true,
        verifyTokenExpiry: true,
      },
    });

    // Do NOT reveal whether user exists or not (security hardening)
    if (!user) {
      return NextResponse.json(
        { error: "Verification link is invalid or already used" },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. EXPIRY CHECK (HARD SECURITY RULE)
    // --------------------------------------------------
    if (!user.verifyTokenExpiry) {
      return NextResponse.json(
        { error: "Invalid verification state" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const expiry = new Date(user.verifyTokenExpiry).getTime();

    if (expiry < now) {
      return NextResponse.json(
        { error: "Verification link expired. Please request a new one." },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 4. ALREADY VERIFIED SAFETY
    // --------------------------------------------------
    if (user.isVerified) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?verified=already`
      );
    }

    // --------------------------------------------------
    // 5. ATOMIC UPDATE (ANTI-REPLAY SECURITY CORE)
    // --------------------------------------------------
    const updateResult = await prisma.user.updateMany({
      where: {
        id: user.id,
        verifyToken: token,
        verifyTokenExpiry: {
          gte: new Date(), // ensures token still valid at DB level
        },
        isVerified: false,
      },
      data: {
        isVerified: true,
        verifyToken: null,
        verifyTokenExpiry: null,
      },
    });

    // If nothing updated → token was already used or invalidated
    if (updateResult.count === 0) {
      return NextResponse.json(
        { error: "Verification failed. Please request a new link." },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 6. WELCOME EMAIL (NON-BLOCKING)
    // --------------------------------------------------
    try {
      await resend.emails.send({
        from: "InfinityForex Team <support@infinityfinancial.cloudns.be>",
        to: user.email,
        subject: "Welcome to InfinityForex 🚀",
        html: welcomeEmailTemplate({
          name: user.name,
        }),
      });
    } catch (emailError) {
      // Email failure must NOT break verification flow
      console.error("Welcome email failed:", emailError);
    }

    // --------------------------------------------------
    // 7. SUCCESS REDIRECT
    // --------------------------------------------------
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/verified`
    );
  } catch (error) {
    console.error("EMAIL VERIFICATION ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/modules/auth/core/auth.config";
import { setupMfa } from "@/modules/auth/mfa/mfa.service";
import { generateQrCode } from "@/modules/auth/mfa/mfa.utils";
import { prisma } from "@/lib/prisma";

/**
 * FINTECH-GRADE MFA SETUP
 * ------------------------
 * - Idempotent
 * - Secure session validation
 * - Audit logging
 * - Prevents duplicate setup abuse
 * - Safe error handling
 */
export async function POST(req: Request) {
  try {
    // =========================
    // 1. AUTH
    // =========================
    const session = await getServerSession(authConfig);

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const email = session.user.email;

    // =========================
    // 2. FETCH USER (SAFE CHECK)
    // =========================
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        mfaEnabled: true,
        mfaSecret: true,
        mfaSetupRequired: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // =========================
    // 3. IDENTITY GUARD (IDEMPOTENCY)
    // =========================
    if (user.mfaEnabled) {
      return NextResponse.json(
        {
          error: "MFA_ALREADY_ENABLED",
          message: "Disable MFA before re-setup",
        },
        { status: 409 }
      );
    }

    // =========================
    // 4. MFA SETUP SERVICE
    // =========================
    const { otpauthUrl } = await setupMfa(userId, email);

    const qr = await generateQrCode(otpauthUrl);

    // =========================
    // 5. OPTIONAL: AUDIT LOG (IMPORTANT)
    // =========================
    await prisma.auditLog.create({
      data: {
        userId,
        action: "MFA_SETUP_INITIATED",
        ip: req.headers.get("x-forwarded-for") || "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        metadata: {
          email,
          timestamp: new Date().toISOString(),
          source: "mfa/setup",
        },
      },
    });

    // =========================
    // 6. RESPONSE
    // =========================
    return NextResponse.json({
      qr,
      otpauthUrl,
    });
  } catch (error: any) {
    console.error("MFA_SETUP_ERROR:", error);

    return NextResponse.json(
      {
        error: "MFA_SETUP_FAILED",
        message:
          process.env.NODE_ENV === "development"
            ? error?.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

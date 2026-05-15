import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/modules/auth/core/auth.config";

/**
 * SECURITY HARDENED MFA DISABLE ENDPOINT
 * --------------------------------------
 * - Requires authenticated session
 * - Invalidates all sessions
 * - Writes structured audit log
 * - Resets MFA credentials safely
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    // =========================
    // 1. AUTH CHECK
    // =========================
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // =========================
    // 2. FETCH USER (SAFE SELECT)
    // =========================
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        mfaEnabled: true,
        mfaSecret: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "USER_NOT_FOUND" },
        { status: 404 }
      );
    }

    // =========================
    // 3. OPTIONAL GUARD (IDEMPOTENT)
    // =========================
    if (!user.mfaEnabled) {
      return NextResponse.json({
        success: true,
        message: "MFA already disabled",
      });
    }

    // =========================
    // 4. SECURITY UPDATE (DISABLE MFA)
    // =========================
    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: [],
        mfaSetupRequired: true,

        // 🔥 invalidate all active sessions/devices
        sessionVersion: { increment: 1 },
      },
    });

    // =========================
    // 5. EXTRACT SECURITY CONTEXT
    // =========================
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const userAgent = req.headers.get("user-agent") || "unknown";

    // =========================
    // 6. AUDIT LOG (FINTECH-GRADE STRUCTURE)
    // =========================
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "MFA_DISABLED",
        ip,
        userAgent,

        // 🔐 REQUIRED FIELD (Prisma Json)
        metadata: {
          timestamp: new Date().toISOString(),
          email: user.email,
          role: user.role,
          securityEvent: "MFA_DISABLED",
          sessionInvalidated: true,
          source: "auth/mfa/disable",
        },
      },
    });

    // =========================
    // 7. RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      message: "MFA disabled successfully",
    });
  } catch (error: any) {
    console.error("MFA_DISABLE_ERROR:", error);

    return NextResponse.json(
      {
        error: "INTERNAL_ERROR",
        message:
          process.env.NODE_ENV === "development"
            ? error?.message
            : undefined,
      },
      { status: 500 }
    );
  }
}

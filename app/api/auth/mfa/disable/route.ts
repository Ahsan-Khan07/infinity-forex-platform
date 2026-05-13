import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/modules/auth/core/auth.config";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email) {
      return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    /**
     * 🔐 DISABLE MFA (SECURE RESET FLOW)
     */
    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: [], // ✅ FIX (never null)
        mfaSetupRequired: true,

        /**
         * 🔥 CRITICAL: SESSION INVALIDATION
         * forces all devices to re-login
         */
        sessionVersion: {
          increment: 1,
        },
      },
    });

    /**
     * 🧾 AUDIT LOG (SECURITY TRACKING)
     */
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "MFA_DISABLED",
        ip: req.headers.get("x-forwarded-for") || null,
        userAgent: req.headers.get("user-agent") || null,
      },
    });

    return Response.json({
      success: true,
      message: "MFA disabled successfully",
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

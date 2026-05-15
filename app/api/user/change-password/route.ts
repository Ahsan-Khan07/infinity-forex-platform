import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authConfig } from "@/modules/auth/core/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { SecurityPolicyEngine } from "@/services/security/engine";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    // Security policy check
    const securityCheck = await SecurityPolicyEngine({
      userId: session.user.id as string,
      action: "CHANGE_PASSWORD",
      ip: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
      payload: { currentPassword, newPassword },
    });

    if (securityCheck.decision === "BLOCK") {
      return NextResponse.json({ error: securityCheck.reason }, { status: 400 });
    }

    if (securityCheck.decision === "MFA_REQUIRED") {
      return NextResponse.json({ error: "MFA_REQUIRED" }, { status: 403 });
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    const valid = await verifyPassword(currentPassword, user.password);

    if (!valid) {
      return NextResponse.json({ error: "INVALID_PASSWORD" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        sessionVersion: { increment: 1 },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_CHANGED",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PASSWORD_CHANGE_ERROR:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

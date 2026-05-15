import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/modules/auth/core/auth.config";
import { prisma } from "@/lib/prisma";
import { SecurityPolicyEngine } from "@/services/security/engine";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { name, email } = await req.json();

    // Security policy check for name change
    if (name) {
      const nameCheck = await SecurityPolicyEngine({
        userId: session.user.id as string,
        action: "CHANGE_NAME",
        ip: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
        payload: { name },
      });

      if (nameCheck.decision === "BLOCK") {
        return NextResponse.json({ error: nameCheck.reason }, { status: 400 });
      }
    }

    // Security policy check for email change
    if (email) {
      const emailCheck = await SecurityPolicyEngine({
        userId: session.user.id as string,
        action: "CHANGE_EMAIL",
        ip: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
        payload: { email },
      });

      if (emailCheck.decision === "BLOCK") {
        return NextResponse.json({ error: emailCheck.reason }, { status: 400 });
      }

      if (emailCheck.decision === "MFA_REQUIRED") {
        return NextResponse.json({ error: "MFA_REQUIRED" }, { status: 403 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: updatedUser.id,
        action: "PROFILE_UPDATED",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

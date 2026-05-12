import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();

  const record = await prisma.pendingDeviceLogin.findFirst({
    where: { token },
  });

  if (!record) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  if (record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Token expired" },
      { status: 400 }
    );
  }

  // 🛑 SAFETY CHECK: ensure required fields exist
  if (!record.userId || !record.fingerprint || !record.ip || !record.userAgent) {
    return NextResponse.json(
      { error: "Invalid device data" },
      { status: 400 }
    );
  }

  // 🟢 APPROVE DEVICE (FIX: UPDATE IF EXISTS)
  const existingDevice = await prisma.trustedDevice.findFirst({
    where: {
      userId: record.userId,
      fingerprint: record.fingerprint,
    },
  });

  if (existingDevice) {
    await prisma.trustedDevice.update({
      where: { id: existingDevice.id },
      data: {
        ip: record.ip,
        userAgent: record.userAgent,
        isTrusted: true,
        lastSeenAt: new Date(),
      },
    });
  } else {
    await prisma.trustedDevice.create({
      data: {
        userId: record.userId,
        fingerprint: record.fingerprint,
        ip: record.ip,
        userAgent: record.userAgent,
        isTrusted: true,
      },
    });
  }

  // 🧹 DELETE PENDING REQUEST (CLEANUP)
  await prisma.pendingDeviceLogin.delete({
    where: { id: record.id },
  });

  return NextResponse.json({ success: true });
}

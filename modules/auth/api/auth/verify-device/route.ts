/**
 * DEVICE VERIFICATION API (ENTERPRISE SECURITY FLOW)
 * ---------------------------------------------------
 * This endpoint is triggered when a user clicks the
 * "Verify New Device" email link.
 *
 * Responsibilities:
 * - Validate token
 * - Approve trusted device
 * - Remove pending device request
 *
 * It does NOT contain business rules or authentication logic.
 */

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // -----------------------------------------------------
    // 1. SAFE BODY PARSING
    // -----------------------------------------------------
    let body;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid or empty request body" },
        { status: 400 }
      );
    }

    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Missing token" },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // 2. FIND PENDING DEVICE REQUEST
    // -----------------------------------------------------
    const record = await prisma.pendingDeviceLogin.findFirst({
      where: { token },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // 3. EXPIRY CHECK
    // -----------------------------------------------------
    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Token expired" },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // 4. VALIDATION SAFETY CHECK
    // -----------------------------------------------------
    if (
      !record.userId ||
      !record.fingerprint ||
      !record.ip ||
      !record.userAgent
    ) {
      return NextResponse.json(
        { error: "Corrupted device verification data" },
        { status: 400 }
      );
    }

    // -----------------------------------------------------
    // 5. UPSERT TRUSTED DEVICE
    // -----------------------------------------------------
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

    // -----------------------------------------------------
    // 6. CLEANUP PENDING REQUEST
    // -----------------------------------------------------
    await prisma.pendingDeviceLogin.delete({
      where: { id: record.id },
    });

    // -----------------------------------------------------
    // 7. SUCCESS RESPONSE
    // -----------------------------------------------------
    return NextResponse.json({
      success: true,
      message: "Device verified successfully",
    });
  } catch (error: any) {
    console.error("VERIFY_DEVICE_ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

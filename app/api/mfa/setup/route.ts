import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  const issuer = "InfinityFinance";

  // 🔐 Generate secret
  const secret = speakeasy.generateSecret({
    name: `${issuer}:${user.email}`, // IMPORTANT (fixes "Unknown")
    issuer,
  });

  // 🔐 Save encrypted secret (for now stored plain, ideally encrypt in production)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      mfaSecret: secret.base32,
    },
  });

  // 📲 Generate QR URL (MOST IMPORTANT FIX)
  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    label: user.email,
    issuer,
    encoding: "base32",
  });

  // 📷 QR IMAGE
  const qrCode = await QRCode.toDataURL(otpauthUrl);

  return NextResponse.json({
    qrCode,
    manualKey: secret.base32,
  });
}

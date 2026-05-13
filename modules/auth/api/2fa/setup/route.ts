import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { encrypt } from "@/lib/crypto";

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const secret = speakeasy.generateSecret({
    name: `Infinity Finance (${email})`,
    issuer: "Infinity Finance",
  });

  await prisma.user.update({
    where: { email },
    data: {
      mfaSecret: encrypt(secret.base32),
      mfaSetupRequired: true,
    },
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

  return NextResponse.json({
    qrCode,
    secret: secret.base32,
  });
}

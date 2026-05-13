import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import speakeasy from "speakeasy";

export async function POST(req: Request) {
  const { email, token } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.twoFactorSecret) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
  });

  if (!verified) {
    return NextResponse.json({ error: "Invalid 2FA code" }, { status: 401 });
  }

  await prisma.user.update({
    where: { email },
    data: {
      twoFactorEnabled: true,
    },
  });

  return NextResponse.json({ success: true });
}

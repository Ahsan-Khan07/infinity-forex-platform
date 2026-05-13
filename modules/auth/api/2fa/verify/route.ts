import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import { decrypt } from "@/lib/crypto";
import { encrypt } from "@/lib/crypto";

export async function POST(req: Request) {
  const { email, token } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.mfaSecret) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const decryptedSecret = decrypt(user.mfaSecret);

  const verified = speakeasy.totp.verify({
    secret: decryptedSecret,
    encoding: "base32",
    token,
    window: 2,
  });

  if (!verified) {
    return NextResponse.json({ error: "Invalid 2FA code" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      mfaEnabled: true,
      mfaSetupRequired: false,
    },
  });

  return NextResponse.json({ success: true });
}

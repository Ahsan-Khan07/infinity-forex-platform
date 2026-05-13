import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import speakeasy from "speakeasy";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession();
  const body = await req.json();

  const { token } = body;

  if (!session?.user?.email) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || !user.mfaSecret) {
    return NextResponse.json({ error: "MFA_NOT_SETUP" }, { status: 400 });
  }

  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: "base32",
    token,
    window: 2,
  });

  if (!verified) {
    return NextResponse.json({ error: "INVALID_2FA" }, { status: 400 });
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

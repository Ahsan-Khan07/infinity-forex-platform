import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/tokens";
import { NextResponse } from "next/server";
import { sendMail } from "@/modules/notifications/core/mailer";

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ success: true });
  }

  const token = generateToken();

  await prisma.user.update({
    where: { email },
    data: { resetToken: token },
  });

  const link = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  await sendMail(email, "Reset Password", link);

  return NextResponse.json({ success: true });
}

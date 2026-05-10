import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { welcomeEmailTemplate } from "@/lib/email/templates/welcome-email";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { verifyToken: token },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  if (user.verifyTokenExpiry && user.verifyTokenExpiry < new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 400 });
  }

  // 🔴 UPDATE USER AS VERIFIED
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verifyToken: null,
      verifyTokenExpiry: null,
    },
  });

  // 🚀 SEND WELCOME EMAIL AFTER VERIFICATION
  await resend.emails.send({
    from: "InfinityForex Team <support@infinityfinancial.cloudns.be>",
    to: updatedUser.email,
    subject: "Welcome to InfinityForex 🚀",
    html: welcomeEmailTemplate({
      name: updatedUser.name,
    }),
  });

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/auth/verified`
  );
}

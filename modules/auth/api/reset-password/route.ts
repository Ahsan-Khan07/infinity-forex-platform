import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  const user = await prisma.user.findFirst({
    where: { resetToken: token },
  });

  if (!user)
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });

  // ❌ CHECK IF NEW PASSWORD IS SAME AS OLD PASSWORD
  const isSamePassword = await verifyPassword(password, user.password);

  if (isSamePassword) {
    return NextResponse.json(
      { error: "New password cannot be the same as the old password" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(password),
      resetToken: null,
    },
  });

  return NextResponse.json({ success: true });
}

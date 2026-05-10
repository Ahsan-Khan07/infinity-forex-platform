import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  const user = await prisma.user.findFirst({
    where: { resetToken: token },
  });

  if (!user)
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(password),
      resetToken: null,
    },
  });

  return NextResponse.json({ success: true });
}

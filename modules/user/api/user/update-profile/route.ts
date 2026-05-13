import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/modules/auth/core/auth.config";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();

  if (!name || typeof name !== "string" || name.length < 2) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      name,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
    },
  });

  return NextResponse.json({
    success: true,
    user: updatedUser,
  });
}

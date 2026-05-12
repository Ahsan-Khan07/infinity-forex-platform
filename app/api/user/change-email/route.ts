import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

/**
 * Change user email + invalidate sessions
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { newEmail } = await req.json();

  if (!newEmail || typeof newEmail !== "string") {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = newEmail.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      email,
      isVerified: false,
      sessionVersion: { increment: 1 },
    },
  });

  return NextResponse.json({
    success: true,
    user: {
      id: updated.id,
      email: updated.email,
    },
  });
}

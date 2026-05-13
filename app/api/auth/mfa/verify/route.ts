import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/modules/auth/core/auth.config";
import { enableMfa } from "@/modules/auth/mfa/mfa.service";

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await req.json();

  try {
    const backupCodes = await enableMfa(session.user.id, token);

    return NextResponse.json({
      success: true,
      backupCodes,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Invalid MFA code" },
      { status: 400 }
    );
  }
}

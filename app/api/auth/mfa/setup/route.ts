import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/modules/auth/core/auth.config";
import { setupMfa } from "@/modules/auth/mfa/mfa.service";
import { generateQrCode } from "@/modules/auth/mfa/mfa.utils";

export async function POST() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { otpauthUrl } = await setupMfa(
    session.user.id,
    session.user.email!
  );

  const qr = await generateQrCode(otpauthUrl);

  return NextResponse.json({
    qr,
    otpauthUrl,
  });
}

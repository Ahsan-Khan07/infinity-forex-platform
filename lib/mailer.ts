import { resend } from "./resend";

import { verifyEmailTemplate } from "@/lib/email/templates/verify-email";

export async function sendVerificationEmail(
  email: string,
  token: string,
  name: string
) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

  return await resend.emails.send({
    from: "InfinityForex Team <support@infinityfinancial.cloudns.be>", // MUST match verified domain
    to: email,
    subject: "Verify your InfinityForex account 🚀",
    html: verifyEmailTemplate({
      name,
      verifyUrl,
    }),
  });
}

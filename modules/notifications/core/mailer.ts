import { resend } from "./resend";

import { verifyEmailTemplate } from "./email/templates/verify-email";

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

// ✅ GENERIC EMAIL SENDER (FOR FORGOT PASSWORD)
export async function sendMail(email: string, subject: string, link: string) {
  return await resend.emails.send({
    from: "InfinityForex Team <support@infinityfinancial.cloudns.be>", // MUST match verified domain
    to: email,
    subject,
    html: `
      <div style="background:#0a0a0a;padding:40px 0;font-family:Arial,sans-serif;">
        <div style="
          max-width:520px;
          margin:0 auto;
          background:#111827;
          border:1px solid rgba(255,255,255,0.08);
          border-radius:16px;
          padding:32px;
          color:#ffffff;
          box-shadow:0 10px 40px rgba(0,0,0,0.6);
        ">

          <h1 style="margin:0;font-size:20px;letter-spacing:0.5px;color:#60a5fa;">
            InfinityForex
          </h1>

          <h2 style="margin-top:18px;font-size:22px;">
            ${subject}
          </h2>

          <p style="color:#9ca3af;font-size:14px;line-height:1.6;">
            Click the button below to continue:
          </p>

          <div style="margin:28px 0;">
            <a href="${link}"
              style="
                display:inline-block;
                padding:12px 22px;
                background:linear-gradient(90deg,#2563eb,#06b6d4);
                color:#ffffff;
                font-weight:bold;
                text-decoration:none;
                border-radius:10px;
                box-shadow:0 8px 20px rgba(37,99,235,0.3);
              ">
              Continue
            </a>
          </div>

          <p style="font-size:12px;color:#6b7280;line-height:1.5;">
            If you did not request this, you can safely ignore this email.
          </p>

          <div style="
            margin-top:24px;
            padding-top:16px;
            border-top:1px solid rgba(255,255,255,0.08);
            font-size:11px;
            color:#6b7280;
          ">
            © ${new Date().getFullYear()} InfinityForex
          </div>

        </div>
      </div>
    `,
  });
}

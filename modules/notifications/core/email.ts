import { resend } from "./resend";
import { deviceVerificationEmailTemplate } from "./email/templates/device-verification";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  await resend.emails.send({
    from: "InfinityForex <no-reply@infinityfinancial.cloudns.be>",
    to: email,
    subject: "Verify your InfinityForex account",
    html: `
      <div style="font-family:Arial;padding:20px">
        <h2>Verify your account</h2>
        <p>Click below to verify your email:</p>
        <a href="${verifyUrl}"
           style="padding:10px 20px;background:#2563eb;color:white;text-decoration:none;border-radius:8px">
          Verify Account
        </a>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  });
}

// 🔐 DEVICE VERIFICATION EMAIL (NEW SECURITY FLOW)
export async function sendDeviceVerificationEmail(email: string, token: string) {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-device?token=${token}`;

  const template = deviceVerificationEmailTemplate(link);

  await resend.emails.send({
    from: "InfinityForex <no-reply@infinityfinancial.cloudns.be>",
    to: email,
    subject: template.subject,
    html: template.html,
  });
}

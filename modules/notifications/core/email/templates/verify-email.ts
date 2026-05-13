export function verifyEmailTemplate({
  name,
  verifyUrl,
}: {
  name: string;
  verifyUrl: string;
}) {
  return `
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
      Verify your account 🚀
    </h2>

    <p style="color:#d1d5db;font-size:14px;line-height:1.6;">
      Hello <b style="color:#ffffff;">${name}</b>,
    </p>

    <p style="color:#9ca3af;font-size:14px;line-height:1.6;">
      Welcome to InfinityForex. To activate your account and access trading dashboard, please verify your email address.
    </p>

    <div style="margin:28px 0;">
      <a href="${verifyUrl}"
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
        Verify Account
      </a>
    </div>

    <p style="font-size:12px;color:#6b7280;line-height:1.5;">
      This link expires in <b>1 hour</b>. If you did not create this account, ignore this email.
    </p>

    <div style="
      margin-top:24px;
      padding-top:16px;
      border-top:1px solid rgba(255,255,255,0.08);
      font-size:11px;
      color:#6b7280;
    ">
      © ${new Date().getFullYear()} InfinityForex. All rights reserved.
    </div>

  </div>
</div>
`;
}

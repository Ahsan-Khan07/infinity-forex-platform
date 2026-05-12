export function deviceVerificationEmailTemplate(link: string) {
  return {
    subject: "New Login Attempt Detected",
    html: `
      <div style="font-family: Arial; line-height: 1.6;">
        <h2>Security Alert 🔐</h2>

        <p>We detected a login attempt from a new device on your InfinityForex account.</p>

        <p>
          If this was you, please verify your device to continue login:
        </p>

        <a href="${link}"
           style="display:inline-block;padding:10px 15px;background:#0ea5e9;color:white;text-decoration:none;border-radius:6px;">
          Verify Device & Continue Login
        </a>

        <p style="margin-top:20px;color:#dc2626;">
          If this wasn’t you, we strongly recommend changing your password immediately and enabling 2FA.
        </p>

        <p style="color:#6b7280;font-size:12px;margin-top:10px;">
          This security check helps protect your trading account and funds.
        </p>
      </div>
    `,
  };
}

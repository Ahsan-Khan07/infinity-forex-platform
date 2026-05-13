export function welcomeEmailTemplate({ name }: { name: string }) {
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

    <h1 style="color:#60a5fa;margin:0;">
      InfinityForex
    </h1>

    <h2 style="margin-top:18px;">
      Welcome aboard 🚀
    </h2>

    <p style="color:#d1d5db;font-size:14px;">
      Hello <b style="color:white;">${name}</b>,
    </p>

    <p style="color:#9ca3af;font-size:14px;">
      Your account has been successfully verified. You now have full access to your trading dashboard, signals, and academy.
    </p>

    <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;color:#6b7280;">
      © ${new Date().getFullYear()} InfinityForex
    </div>

  </div>
</div>
`;
}

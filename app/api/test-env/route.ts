export async function GET() {
  return Response.json({
    resend: process.env.RESEND_API_KEY,
    mailFrom: process.env.MAIL_FROM,
  });
}

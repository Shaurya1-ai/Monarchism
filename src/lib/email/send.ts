/** Email delivery — logs in dev when SMTP is not configured */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const { SMTP_HOST, SMTP_USER, NEXT_PUBLIC_APP_URL } = process.env;

  if (!SMTP_HOST || !SMTP_USER) {
    console.info("[Email:dev]", {
      to: params.to,
      subject: params.subject,
      appUrl: NEXT_PUBLIC_APP_URL,
      bodyPreview: params.html.slice(0, 300),
    });
    return { sent: false, dev: true };
  }

  // Install nodemailer and configure SMTP_* env vars for production email
  console.warn(
    "[Email] SMTP configured but nodemailer is not installed. Run: npm install nodemailer"
  );
  return { sent: false, dev: false };
}

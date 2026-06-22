import nodemailer from "nodemailer";
import type Transporter from "nodemailer/lib/mailer";

const APP_URL = process.env.APP_URL || "https://aimsurveyjob.com";
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "AIM Coaching <mehedirubel@aimsurveyjob.com>";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

let transporter: Transporter | null | undefined;

function getTransporter() {
  if (transporter !== undefined) return transporter;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    transporter = null;
    return transporter;
  }

  const host = process.env.SMTP_HOST || "smtp.hostinger.com";
  const port = Number(process.env.SMTP_PORT || "465");
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function appUrl(path: string) {
  return `${APP_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn("[email] SMTP_USER/SMTP_PASS not set — skipping email to", to);
    return false;
  }

  await mailer.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    html,
    text,
  });

  return true;
}

export function emailLayout(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
        <tr><td style="background:#4f46e5;padding:20px 24px;">
          <p style="margin:0;color:#fff;font-size:18px;font-weight:700;">AIM Coaching</p>
        </td></tr>
        <tr><td style="padding:24px;">
          <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">${title}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;">
          <p style="margin:0;font-size:12px;color:#64748b;">AIM Coaching · <a href="${APP_URL}" style="color:#4f46e5;">aimsurveyjob.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function ctaButton(label: string, href: string) {
  return `<p style="margin:24px 0 0;">
    <a href="${href}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;font-size:14px;">${label}</a>
  </p>`;
}

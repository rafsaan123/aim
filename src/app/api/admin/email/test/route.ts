import { NextResponse } from "next/server";
import { Role } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth";
import { emailLayout, sendEmail, verifyEmailConfig } from "@/lib/email";

export async function POST(request: Request) {
  const session = await requireSession(Role.ADMIN);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const to =
    typeof body.to === "string" && body.to.trim()
      ? body.to.trim()
      : session.email;

  const verified = await verifyEmailConfig();
  if (!verified.ok) {
    return NextResponse.json(
      {
        error: "SMTP connection failed",
        detail: verified.error,
        hint:
          "Check SMTP_USER, SMTP_PASS, and SMTP_HOST on Vercel. Hostinger Titan mail often uses smtp.titan.email instead of smtp.hostinger.com.",
      },
      { status: 503 }
    );
  }

  try {
    await sendEmail({
      to,
      subject: "AIM Coaching — test email",
      text: `This is a test email from AIM Coaching (${process.env.APP_URL || "https://aimsurveyjob.com"}). SMTP is working.`,
      html: emailLayout(
        "Test email",
        `<p style="margin:0;color:#334155;line-height:1.5;">
           SMTP is configured correctly. Student notifications will be sent to
           <strong>enrolled students</strong> when you add materials, tests, or publish results.
         </p>`
      ),
    });

    return NextResponse.json({
      success: true,
      sentTo: to,
      smtpHost: process.env.SMTP_HOST || "smtp.hostinger.com",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: "Failed to send test email",
        detail: message,
        hint:
          "Try SMTP_HOST=smtp.titan.email, SMTP_PORT=465, SMTP_SECURE=true — or port 587 with SMTP_SECURE=false.",
      },
      { status: 502 }
    );
  }
}

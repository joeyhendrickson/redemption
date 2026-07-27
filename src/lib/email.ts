import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.log("[email:stub]", { to, subject });
    return { success: true, stub: true };
  }

  const from = process.env.EMAIL_FROM ?? "Redemption Home Services <noreply@redemptionhomeservices.com>";

  await resend.emails.send({ from, to, subject, html });
  return { success: true };
}

export function serviceRequestConfirmationEmail({
  name,
  referenceNumber,
  activateUrl,
}: {
  name: string;
  referenceNumber: string;
  activateUrl?: string;
}) {
  return {
    subject: `Service request received — ${referenceNumber}`,
    html: `
      <h1>Thank you, ${name}!</h1>
      <p>We received your service request (<strong>${referenceNumber}</strong>).</p>
      <p>Our team will review your request and contact you soon.</p>
      ${
        activateUrl
          ? `<p><a href="${activateUrl}">Create your free account</a> to track progress, upload photos, and message our team.</p>`
          : ""
      }
      <p>— Redemption Home Services</p>
    `,
  };
}

export function accountVerificationEmail({ name, verifyUrl }: { name: string; verifyUrl: string }) {
  return {
    subject: "Verify your Redemption Home Services account",
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Please verify your email to access your customer portal.</p>
      <p><a href="${verifyUrl}">Verify email address</a></p>
      <p>— Redemption Home Services</p>
    `,
  };
}

import { Resend } from "resend";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.log("[email:stub]", { to, subject });
    return { success: true as const, stub: true as const };
  }

  const from = process.env.EMAIL_FROM ?? "Redemption Home Services <noreply@redemptionhomeservices.com>";

  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    console.error("[email:send-failed]", { to, subject, error });
    return { success: false as const, error: error.message };
  }

  return { success: true as const };
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
      <p>Thanks for creating your customer account. Click the button below to verify your email and access your portal.</p>
      <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px;">Verify email address</a></p>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>After verifying, return to the site and sign in with your email and password.</p>
      <p>— Redemption Home Services</p>
    `,
  };
}

export function jobCompletedReviewEmail({
  name,
  jobReference,
  reviewUrl,
}: {
  name: string;
  jobReference: string;
  reviewUrl: string;
}) {
  return {
    subject: `Job completed — share your feedback (${jobReference})`,
    html: `
      <h1>Your job is complete, ${name}!</h1>
      <p>Job <strong>${jobReference}</strong> has been marked complete.</p>
      <p>Please take a moment to review your experience and let us know if anything still needs attention.</p>
      <p><a href="${reviewUrl}">Leave your review</a></p>
      <p>— Redemption Home Services</p>
    `,
  };
}

export function reviewIssueAlertEmail({
  jobReference,
  customerName,
  issueDescription,
  adminUrl,
}: {
  jobReference: string;
  customerName: string;
  issueDescription: string;
  adminUrl: string;
}) {
  return {
    subject: `Unresolved issue reported — ${jobReference}`,
    html: `
      <h1>Customer reported an unresolved issue</h1>
      <p><strong>Job:</strong> ${jobReference}</p>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Issue:</strong> ${issueDescription}</p>
      <p><a href="${adminUrl}">View job in admin portal</a></p>
    `,
  };
}

export function invoiceReadyEmail({
  name,
  invoiceNumber,
  total,
  payUrl,
}: {
  name: string;
  invoiceNumber: string;
  total: string;
  payUrl: string;
}) {
  return {
    subject: `Invoice ready — ${invoiceNumber}`,
    html: `
      <h1>Invoice ready, ${name}</h1>
      <p>Invoice <strong>${invoiceNumber}</strong> for <strong>${total}</strong> is ready.</p>
      <p><a href="${payUrl}">View and pay invoice</a></p>
      <p>— Redemption Home Services</p>
    `,
  };
}

export function newServiceRequestAdminEmail({
  referenceNumber,
  customerName,
  email,
  phone,
  serviceCategory,
  title,
  description,
  urgencyLevel,
  serviceAddress,
  city,
  state,
  zipCode,
  isEmergencyFlagged,
  adminUrl,
}: {
  referenceNumber: string;
  customerName: string;
  email: string;
  phone: string;
  serviceCategory: string;
  title: string;
  description: string;
  urgencyLevel: string;
  serviceAddress: string;
  city: string;
  state: string;
  zipCode: string;
  isEmergencyFlagged: boolean;
  adminUrl: string;
}) {
  return {
    subject: `${isEmergencyFlagged ? "Emergency — " : ""}New service request — ${referenceNumber}`,
    html: `
      <h1>New service request from a potential customer</h1>
      <p>A new request was submitted by someone without an existing account.</p>
      <p><strong>Reference:</strong> ${escapeHtml(referenceNumber)}</p>
      <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
      <p><strong>Email:</strong> <a href="mailto:${encodeURIComponent(email)}">${escapeHtml(email)}</a></p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Service:</strong> ${escapeHtml(serviceCategory)} — ${escapeHtml(title)}</p>
      <p><strong>Urgency:</strong> ${escapeHtml(urgencyLevel)}${isEmergencyFlagged ? " (flagged for emergency review)" : ""}</p>
      <p><strong>Address:</strong> ${escapeHtml(serviceAddress)}, ${escapeHtml(city)}, ${escapeHtml(state)} ${escapeHtml(zipCode)}</p>
      <p><strong>Description:</strong></p>
      <p>${escapeHtml(description).replace(/\n/g, "<br />")}</p>
      <p><a href="${adminUrl}" style="display:inline-block;padding:12px 20px;background:#000;color:#fff;text-decoration:none;border-radius:6px;">Review in admin portal</a></p>
      <p>— Redemption Home Services</p>
    `,
  };
}

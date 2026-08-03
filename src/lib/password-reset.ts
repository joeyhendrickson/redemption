import { createClient } from "@supabase/supabase-js";
import { getAppUrl, getPasswordRecoveryCallbackUrl } from "@/lib/app-url";
import { db } from "@/lib/db";
import { passwordResetCodeEmail, sendEmail } from "@/lib/email";
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/config";

export type PasswordResetDelivery = "code" | "link";

export type PasswordResetResult =
  | { sent: true; delivery: PasswordResetDelivery; provider: "resend" | "supabase" }
  | { sent: false; reason: "user_not_found" | "delivery_failed" };

function canSendBrandedEmail() {
  const from = process.env.EMAIL_FROM ?? "";
  return Boolean(process.env.RESEND_API_KEY) && !/@gmail\.com>/i.test(from);
}

function getServiceClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getAnonClient() {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function sendSupabaseRecoveryLink(email: string, request?: Request) {
  const anon = getAnonClient();
  const redirectTo = getPasswordRecoveryCallbackUrl(request);
  console.info("[password-reset] recovery redirectTo:", redirectTo);
  const { error } = await anon.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    console.error("[password-reset] resetPasswordForEmail failed:", error.message);
    throw new Error("Unable to send password reset email.");
  }

  return { sent: true as const, delivery: "link" as const, provider: "supabase" as const };
}

export async function sendPasswordResetCode({
  email,
  request,
}: {
  email: string;
  request?: Request;
}): Promise<PasswordResetResult> {
  const normalizedEmail = email.toLowerCase();

  if (!canSendBrandedEmail()) {
    return sendSupabaseRecoveryLink(normalizedEmail, request);
  }

  const supabase = getServiceClient();
  const redirectTo = `${getAppUrl(request)}/login`;

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: normalizedEmail,
    options: { redirectTo },
  });

  if (error) {
    console.error("[password-reset] generateLink failed:", error.message);
    return { sent: false, reason: "user_not_found" };
  }

  const code = data.properties?.email_otp;
  if (!code) {
    console.error("[password-reset] generateLink did not return email_otp");
    return sendSupabaseRecoveryLink(normalizedEmail, request);
  }

  const user = await db.user.findUnique({ where: { email: normalizedEmail } }).catch(() => null);
  const name = user?.firstName ?? normalizedEmail.split("@")[0] ?? "there";
  const emailContent = passwordResetCodeEmail({ name, code });
  const result = await sendEmail({
    to: normalizedEmail,
    subject: emailContent.subject,
    html: emailContent.html,
  });

  if (!result.success) {
    console.warn("[password-reset] Resend unavailable, falling back to Supabase recovery email");
    return sendSupabaseRecoveryLink(normalizedEmail, request);
  }

  return { sent: true, delivery: "code", provider: "resend" };
}

export async function resetPasswordWithCode({
  email,
  code,
  password,
}: {
  email: string;
  code: string;
  password: string;
}) {
  const normalizedEmail = email.toLowerCase();
  const anon = getAnonClient();
  const service = getServiceClient();

  const { data, error } = await anon.auth.verifyOtp({
    email: normalizedEmail,
    token: code.trim(),
    type: "recovery",
  });

  if (error || !data.user) {
    throw new Error("Invalid or expired reset code. Request a new code and try again.");
  }

  const { error: updateError } = await service.auth.admin.updateUserById(data.user.id, {
    password,
  });

  if (updateError) {
    throw new Error(updateError.message);
  }

  return { success: true as const };
}

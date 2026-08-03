import { createClient } from "@supabase/supabase-js";
import { getAppUrl } from "@/lib/app-url";
import { db } from "@/lib/db";
import { passwordResetCodeEmail, sendEmail } from "@/lib/email";
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/config";

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

export async function sendPasswordResetCode({
  email,
  request,
}: {
  email: string;
  request?: Request;
}) {
  const normalizedEmail = email.toLowerCase();
  const supabase = getServiceClient();
  const redirectTo = `${getAppUrl(request)}/login`;

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: normalizedEmail,
    options: { redirectTo },
  });

  if (error) {
    console.error("[password-reset] generateLink failed:", error.message);
    return { sent: false as const };
  }

  const code = data.properties?.email_otp;
  if (!code) {
    console.error("[password-reset] generateLink did not return email_otp");
    return { sent: false as const };
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
    const anon = getAnonClient();
    const { error: resetError } = await anon.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${getAppUrl(request)}/auth/callback?type=recovery&next=/forgot-password`,
    });

    if (resetError) {
      console.error("[password-reset] fallback resetPasswordForEmail failed:", resetError.message);
      throw new Error("Unable to send password reset email.");
    }

    return { sent: true as const, provider: "supabase" as const };
  }

  return { sent: true as const, provider: "resend" as const };
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

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getAuthCallbackUrl } from "@/lib/app-url";
import { accountVerificationEmail, sendEmail } from "@/lib/email";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";

type ServiceClient = SupabaseClient;

function getAnonAuthClient() {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey());
}

export async function sendSupabaseSignupConfirmation({
  email,
  request,
}: {
  email: string;
  request?: Request;
}) {
  const redirectTo = getAuthCallbackUrl(request, "/customer");
  const supabase = getAnonAuthClient();

  const { error: resendError } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (!resendError) {
    return { redirectTo, method: "signup-resend" as const };
  }

  const { error: otpError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      shouldCreateUser: false,
    },
  });

  if (otpError) {
    throw new Error(otpError.message);
  }

  return { redirectTo, method: "magiclink" as const };
}

export async function deliverAccountVerificationEmail({
  to,
  name,
  verifyUrl,
  request,
}: {
  to: string;
  name: string;
  verifyUrl?: string;
  request?: Request;
}) {
  try {
    await sendSupabaseSignupConfirmation({ email: to, request });
    return { provider: "supabase" as const };
  } catch (supabaseError) {
    console.error("[email:supabase-verification-failed]", supabaseError);

    if (!verifyUrl) {
      throw new Error(
        supabaseError instanceof Error
          ? supabaseError.message
          : "Verification email could not be sent.",
      );
    }

    try {
      const emailContent = accountVerificationEmail({ name, verifyUrl });
      await sendEmail({ to, subject: emailContent.subject, html: emailContent.html });
      return { provider: "resend" as const };
    } catch (resendError) {
      console.error("[email:resend-verification-failed]", resendError);
      throw new Error(
        supabaseError instanceof Error
          ? supabaseError.message
          : "Verification email could not be sent.",
      );
    }
  }
}

export async function sendAccountVerificationEmail({
  to,
  name,
  verifyUrl,
  request,
}: {
  to: string;
  name: string;
  verifyUrl?: string;
  request?: Request;
}) {
  return deliverAccountVerificationEmail({
    to,
    name,
    verifyUrl,
    request,
  });
}

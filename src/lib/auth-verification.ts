import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getAuthCallbackUrl } from "@/lib/app-url";
import { accountVerificationEmail, sendEmail } from "@/lib/email";

type ServiceClient = SupabaseClient;

function getAnonAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
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

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    throw new Error(error.message);
  }

  return { redirectTo };
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

export async function createSignupVerificationLink(
  supabase: ServiceClient,
  {
    email,
    password,
    request,
  }: {
    email: string;
    password: string;
    request?: Request;
  },
) {
  const redirectTo = getAuthCallbackUrl(request, "/customer");

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: { redirectTo },
  });

  if (error || !data.properties.action_link || !data.user) {
    throw new Error(error?.message ?? "Unable to create verification link.");
  }

  return {
    userId: data.user.id,
    verifyUrl: data.properties.action_link,
  };
}

export async function createVerificationResendLink(
  supabase: ServiceClient,
  {
    email,
    request,
  }: {
    email: string;
    request?: Request;
  },
) {
  const redirectTo = getAuthCallbackUrl(request, "/customer");

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error || !data.properties.action_link) {
    throw new Error(error?.message ?? "Unable to create verification link.");
  }

  return data.properties.action_link;
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

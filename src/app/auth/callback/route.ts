import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getAppUrl } from "@/lib/app-url";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/customer";
  const safeNext = next.startsWith("/") ? next : "/customer";

  const origin = getAppUrl(request);
  const successUrl = `${origin}/login?verified=1&email=${encodeURIComponent(searchParams.get("email") ?? "")}`;
  const errorUrl = `${origin}/login?error=verification_failed`;

  if (searchParams.get("error")) {
    console.error("[auth/callback] provider error:", searchParams.get("error_description"));
    return NextResponse.redirect(errorUrl);
  }

  const supabaseResponse = NextResponse.redirect(successUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return supabaseResponse;
    }
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return supabaseResponse;
    }
    console.error("[auth/callback] verifyOtp failed:", error.message);
  }

  return NextResponse.redirect(errorUrl);
}

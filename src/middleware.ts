import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const protectedPrefixes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/contractor": ["CONTRACTOR"],
  "/customer": ["CUSTOMER", "ADMIN"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const supabaseResponse = await updateSession(request);

  const matchedPrefix = Object.keys(protectedPrefixes).find((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!matchedPrefix) {
    return supabaseResponse;
  }

  const { createServerClient } = await import("@supabase/ssr");
  const { getSupabaseAnonKey, getSupabaseUrl } = await import("@/lib/supabase/config");
  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/contractor/:path*",
    "/customer/:path*",
    "/login",
    "/register",
  ],
};
